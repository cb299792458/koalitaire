import { ref, type Ref } from 'vue';
import type Player from '../models/Player';
import { SpellCard } from '../models/Card';
import type { SpellCardParams } from '../models/Card';
import { generalCards } from '../game/cards/generalCards';

export const STAT_STORE_IDS = ['attackStore', 'armorStore', 'arcaneStore', 'agilityStore', 'appealStore'] as const;
export type StatStoreId = typeof STAT_STORE_IDS[number];

const STAT_TO_PLAYER_KEY: Record<StatStoreId, keyof Player> = {
    attackStore: 'attack',
    armorStore: 'armor',
    arcaneStore: 'arcane',
    agilityStore: 'agility',
    appealStore: 'appeal',
};

const playerRef = ref<Player | null>(null);
const isInTownRef = ref(false);
const innUsedThisVisitRef = ref(false);
const bloodbankUseCountRef = ref(0);
const statUpgradeCountsRef = ref<Record<StatStoreId, number>>({
    attackStore: 0,
    armorStore: 0,
    arcaneStore: 0,
    agilityStore: 0,
    appealStore: 0,
});
/** Card names purchased at the store this visit (one of each per visit). */
const storePurchasedCardNamesRef = ref<Set<string>>(new Set());
/** Five random cards offered at the store this visit. */
const storeCardsRef = ref<SpellCardParams[]>([]);

export interface TraderOffer {
    playerCard: SpellCard;
    generalCard: SpellCardParams;
}
const traderOffersRef = ref<TraderOffer[]>([]);

let onLeaveTownCallback: (() => void) | undefined;

function shuffle<T>(array: T[]): T[] {
    const out = [...array];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j]!, out[i]!];
    }
    return out;
}

function pickRandom<T>(array: T[], count: number): T[] {
    const shuffled = shuffle([...array]);
    return shuffled.slice(0, Math.min(count, array.length));
}

const STORE_CARD_PRICE = 10;

/** HP cost per bloodbank donation: 25% of max HP, rounded down. */
function getBloodbankHpCost(maxHealth: number): number {
    return Math.floor(maxHealth * 0.25);
}

const BLOODBANK_GOLD_REWARD = 100;
const BLOODBANK_MAX_PER_VISIT = 3;

const REST_COST = 50;

const STAT_UPGRADE_BASE_COST = 10;
/** Gold cost for next stat upgrade: 10, 20, 30, ... */
function getStatUpgradeCost(useCount: number): number {
    return STAT_UPGRADE_BASE_COST * (useCount + 1);
}

/** Stock market: price per bytecoin = player level * 10 */
function getBytecoinPrice(level: number): number {
    return level * 10;
}

export function useTown(): {
    player: Ref<Player | null>;
    isInTown: Ref<boolean>;
    innUsedThisVisit: Ref<boolean>;
    bloodbankUseCount: Ref<number>;
    statUpgradeCounts: Ref<Record<StatStoreId, number>>;
    enterTown: (player: Player) => void;
    leaveTown: () => void;
    onLeaveTown: (fn: () => void) => void;
    restAtInn: () => void;
    getRestCost: () => number;
    getBloodbankHpCost: (maxHealth: number) => number;
    getBloodbankGoldReward: () => number;
    getBloodbankMaxPerVisit: () => number;
    sellBloodAtBloodbank: () => void;
    getStatUpgradeCost: (storeId: StatStoreId, useCount: number) => number;
    upgradeStatAtStore: (storeId: StatStoreId) => void;
    getBytecoinPrice: (level: number) => number;
    buyBytecoin: () => void;
    sellBytecoin: () => void;
    storeCards: Ref<SpellCardParams[]>;
    refreshStoreCards: () => void;
    getStoreCardPrice: () => number;
    traderOffers: Ref<TraderOffer[]>;
    refreshTraderOffers: () => void;
    doTrade: (slotIndex: number) => void;
    isStoreCardPurchased: (cardName: string) => boolean;
    canBuyStoreCard: (cardName: string) => boolean;
    buyStoreCard: (cardParams: SpellCardParams) => void;
} {
    return {
        player: playerRef as Ref<Player | null>,
        isInTown: isInTownRef,
        innUsedThisVisit: innUsedThisVisitRef,
        bloodbankUseCount: bloodbankUseCountRef,
        enterTown(player: Player) {
            // Same reference as combat.player when entering from scenario; stat upgrades persist into next combat.
            playerRef.value = player;
            isInTownRef.value = true;
            innUsedThisVisitRef.value = false;
            bloodbankUseCountRef.value = 0;
            storePurchasedCardNamesRef.value = new Set();
            storeCardsRef.value = [];
            statUpgradeCountsRef.value = {
                attackStore: 0,
                armorStore: 0,
                arcaneStore: 0,
                agilityStore: 0,
                appealStore: 0,
            };
        },
        leaveTown() {
            isInTownRef.value = false;
            onLeaveTownCallback?.();
        },
        onLeaveTown(fn: () => void) {
            onLeaveTownCallback = fn;
        },
        restAtInn() {
            const p = playerRef.value;
            if (!p || innUsedThisVisitRef.value) return;
            if (p.gold < REST_COST) return;
            const missing = p.maxHealth - p.health;
            if (missing <= 0) return;
            p.gold -= REST_COST;
            const healAmount = Math.ceil(missing * 0.75);
            p.gainHealth(healAmount);
            innUsedThisVisitRef.value = true;
        },
        getRestCost: () => REST_COST,
        getBloodbankHpCost,
        getBloodbankGoldReward: () => BLOODBANK_GOLD_REWARD,
        getBloodbankMaxPerVisit: () => BLOODBANK_MAX_PER_VISIT,
        sellBloodAtBloodbank() {
            const p = playerRef.value;
            if (!p) return;
            if (bloodbankUseCountRef.value >= BLOODBANK_MAX_PER_VISIT) return;
            const cost = getBloodbankHpCost(p.maxHealth);
            if (p.health <= cost) return; // need to keep at least 1 HP
            p.health -= cost;
            if (p.health < 1) p.health = 1;
            p.gold += BLOODBANK_GOLD_REWARD;
            bloodbankUseCountRef.value += 1;
        },
        getStatUpgradeCost: (_storeId: StatStoreId, useCount: number) => getStatUpgradeCost(useCount),
        statUpgradeCounts: statUpgradeCountsRef,
        upgradeStatAtStore(storeId: StatStoreId) {
            const p = playerRef.value;
            if (!p) return;
            const counts = { ...statUpgradeCountsRef.value };
            const useCount = counts[storeId] ?? 0;
            const cost = getStatUpgradeCost(useCount);
            if (p.gold < cost) return;
            const key = STAT_TO_PLAYER_KEY[storeId];
            const current = (p[key] as number) ?? 0;
            (p as unknown as Record<string, number>)[key] = current + 1;
            p.gold -= cost;
            counts[storeId] = useCount + 1;
            statUpgradeCountsRef.value = counts;
        },
        getBytecoinPrice,
        buyBytecoin() {
            const p = playerRef.value;
            if (!p) return;
            const price = getBytecoinPrice(p.level);
            if (p.gold < price) return;
            p.gold -= price;
            p.bytecoins += 1;
        },
        sellBytecoin() {
            const p = playerRef.value;
            if (!p || p.bytecoins < 1) return;
            const price = getBytecoinPrice(p.level);
            p.bytecoins -= 1;
            p.gold += price;
        },
        storeCards: storeCardsRef,
        refreshStoreCards() {
            storeCardsRef.value = shuffle([...generalCards]).slice(0, 5);
        },
        getStoreCardPrice: () => STORE_CARD_PRICE,
        isStoreCardPurchased(cardName: string) {
            return storePurchasedCardNamesRef.value.has(cardName);
        },
        canBuyStoreCard(cardName: string) {
            const p = playerRef.value;
            if (!p) return false;
            if (storePurchasedCardNamesRef.value.has(cardName)) return false;
            return p.gold >= STORE_CARD_PRICE;
        },
        buyStoreCard(cardParams: SpellCardParams) {
            const p = playerRef.value;
            if (!p) return;
            if (storePurchasedCardNamesRef.value.has(cardParams.name)) return;
            if (p.gold < STORE_CARD_PRICE) return;
            p.gold -= STORE_CARD_PRICE;
            storePurchasedCardNamesRef.value = new Set(storePurchasedCardNamesRef.value).add(cardParams.name);
            const card = new SpellCard(
                cardParams.rank,
                cardParams.suit,
                cardParams.name,
                cardParams.description,
                cardParams.effect,
                cardParams.charges,
                cardParams.keywords,
                cardParams.flavorText
            );
            p.allCards.push(card);
            p.deckList.push(true);
        },
        traderOffers: traderOffersRef,
        refreshTraderOffers() {
            const p = playerRef.value;
            if (!p) {
                traderOffersRef.value = [];
                return;
            }
            const spellCards = p.allCards.filter((_, i) => p.deckList[i]);
            const playerCards = pickRandom(spellCards, 3);
            const generalCardsPicked = pickRandom([...generalCards], 3);
            const offers: TraderOffer[] = [];
            for (let i = 0; i < 3; i++) {
                const pc = playerCards[i];
                const gc = generalCardsPicked[i];
                if (pc && gc) {
                    pc.revealed = true;
                    offers.push({ playerCard: pc, generalCard: gc });
                }
            }
            traderOffersRef.value = offers;
        },
        doTrade(slotIndex: number) {
            const p = playerRef.value;
            const offers = [...traderOffersRef.value];
            const offer = offers[slotIndex];
            if (!p || !offer) return;

            const { playerCard, generalCard } = offer;
            const cardIndex = p.allCards.indexOf(playerCard);
            if (cardIndex === -1) return;

            p.allCards[cardIndex] = new SpellCard(
                generalCard.rank,
                generalCard.suit,
                generalCard.name,
                generalCard.description,
                generalCard.effect,
                generalCard.charges,
                generalCard.keywords,
                generalCard.flavorText
            );

            offers.splice(slotIndex, 1);
            traderOffersRef.value = offers;
        },
    };
}
