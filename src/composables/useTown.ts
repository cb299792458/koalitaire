import { ref, type Ref } from 'vue';
import type Player from '../models/Player';

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
let onLeaveTownCallback: (() => void) | undefined;

/** HP cost per bloodbank donation: 25% of max HP, rounded down. */
function getBloodbankHpCost(maxHealth: number): number {
    return Math.floor(maxHealth * 0.25);
}

const BLOODBANK_GOLD_REWARD = 100;

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
    sellBloodAtBloodbank: () => void;
    getStatUpgradeCost: (storeId: StatStoreId, useCount: number) => number;
    upgradeStatAtStore: (storeId: StatStoreId) => void;
    getBytecoinPrice: (level: number) => number;
    buyBytecoin: () => void;
    sellBytecoin: () => void;
} {
    return {
        player: playerRef,
        isInTown: isInTownRef,
        innUsedThisVisit: innUsedThisVisitRef,
        bloodbankUseCount: bloodbankUseCountRef,
        enterTown(player: Player) {
            // Same reference as combat.player when entering from scenario; stat upgrades persist into next combat.
            playerRef.value = player;
            isInTownRef.value = true;
            innUsedThisVisitRef.value = false;
            bloodbankUseCountRef.value = 0;
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
        sellBloodAtBloodbank() {
            const p = playerRef.value;
            if (!p) return;
            const cost = getBloodbankHpCost(p.maxHealth);
            if (p.health <= cost) return; // need to keep at least 1 HP
            p.health -= cost;
            if (p.health < 1) p.health = 1;
            p.gold += BLOODBANK_GOLD_REWARD;
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
    };
}
