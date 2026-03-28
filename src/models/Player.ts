import Card, { SpellCard, type SpellCardParams } from "./Card";
import { Suit, Suits } from "./Suit";
import Combatant from "./Combatant";
import type { DamageNumberType } from "./Combatant";

import koaPortrait from "/player_portraits/koa.png";
import platypusPortrait from "/enemy_portraits/platypus.png";
import { openMessageModal } from "../stores/modalStore";
import useDamageNumbers from "../composables/useDamageNumbers";
import { starterCards } from "../game/cards/starterCards";
import { generalCards } from "../game/cards/generalCards";
import { debugCards } from "../game/cards/debugCards";

/** Per-suit count of mana cards to bring to combat (ranks 1 through N). */
export type ManaCardsBySuit = Partial<Record<Suit, number>>;

export interface PlayerParams {
    name: string;
    portrait: string;
    /** Tooltip text on portrait hover. Defaults to name if not set. */
    tooltip?: string;

    /** Number of tableau columns (layout is per character, e.g. Koa). */
    columnCount: number;
    /** Number of free cell (hand) slots. */
    handSlotCount: number;
    /** Mana diamonds at the start of combat. Defaults to 0. */
    startingManaDiamonds?: number;

    appeal: number;
    attack: number;
    armor: number;
    agility: number;
    acumen: number;

    health: number;
    koallarbucks: number;
    bytecoins?: number;

    /** All spell cards the player owns. */
    collection: SpellCard[];
    /** Per-suit count of mana cards to bring to combat. For Koa, starts at 6 per suit. */
    manaDeck: ManaCardsBySuit;

    /** Pre-generated store cards (set at run start, not per visit). */
    townStoreCards?: SpellCardParams[];
    /** Pre-generated trader cards (set at run start, not per visit). */
    townTraderCards?: SpellCardParams[];
}

function defaultManaCards(countPerSuit: number): ManaCardsBySuit {
    return Object.fromEntries(Suits.map(suit => [suit, countPerSuit])) as ManaCardsBySuit;
}

function spellCardsFromParams(params: SpellCardParams[]): SpellCard[] {
    return params.map(p => new SpellCard(
        p.rank,
        p.suit,
        p.name,
        p.description,
        p.effect,
        p.charges,
        p.keywords,
        p.flavorText
    ));
}

function pickRandom<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, array.length));
}

class Player extends Combatant {
    level: number = 1;

    /** Row in the diamond scenario (0 = start, 12 = boss). */
    scenarioRow: number = 0;
    /** Column within the row. */
    scenarioColumn: number = 0;

    columnCount: number;
    handSlotCount: number;
    startingManaDiamonds: number;

    appeal: number;
    attack: number;
    agility: number;
    acumen: number;

    manaDiamonds: number = 0;
    koallarbucks: number;
    bytecoins: number = 0;

    /** All spell cards the player owns. */
    collection: SpellCard[];
    /** Same length as collection; true = card is in combat deck. */
    spellDeck: boolean[];
    /** Per-suit count of mana cards to bring to combat. */
    manaDeck: ManaCardsBySuit;

    /** Pre-generated store cards (set at run start). */
    townStoreCards: SpellCardParams[];
    /** Pre-generated trader cards (set at run start). */
    townTraderCards: SpellCardParams[];

    /** Reference to the original player when this is a combat copy; used to sync HP at combat end. */
    originalPlayer?: Player;

    constructor(params: PlayerParams) {
        const { name, portrait, tooltip, columnCount, handSlotCount, startingManaDiamonds = 0, appeal, attack, armor, agility, acumen, health, koallarbucks, bytecoins = 0, collection, manaDeck, townStoreCards, townTraderCards } = params;
        super({ name, portrait, health, armor, tooltip });

        this.columnCount = columnCount;
        this.handSlotCount = handSlotCount;
        this.startingManaDiamonds = startingManaDiamonds;
        this.appeal = appeal;
        this.attack = attack;
        this.agility = agility;
        this.acumen = acumen;

        this.koallarbucks = koallarbucks;
        this.bytecoins = bytecoins;

        this.collection = [...collection];
        this.spellDeck = collection.map(() => true);
        this.manaDeck = { ...manaDeck };

        this.townStoreCards = townStoreCards ?? pickRandom([...generalCards], 5);
        this.townTraderCards = townTraderCards ?? pickRandom([...generalCards], 3);
    }

    /** Build the full combat deck from spell cards (where spellDeck is true) plus mana cards. */
    getCombatDeck(): Card[] {
        const cards: Card[] = [];
        for (let i = 0; i < this.collection.length; i++) {
            if (this.spellDeck[i]) {
                const spellCard = this.collection[i]!;
                cards.push(new SpellCard(
                    spellCard.rank,
                    spellCard.suit,
                    spellCard.name,
                    spellCard.description,
                    spellCard.effect,
                    spellCard.charges,
                    spellCard.keywords,
                    spellCard.flavorText
                ));
            }
        }
        for (const suit of Suits) {
            const count = this.manaDeck[suit] ?? 0;
            for (let rank = 1; rank <= count; rank++) {
                cards.push(new Card(rank, suit));
            }
        }
        return cards;
    }

    /** Number of cards in the combat deck. */
    get deckSize(): number {
        const spellCount = this.spellDeck.filter(Boolean).length;
        const manaCount = Suits.reduce((sum, suit) => sum + (this.manaDeck[suit] ?? 0), 0);
        return spellCount + manaCount;
    }

    protected addDamageNumber(amount: number, type: DamageNumberType): void {
        useDamageNumbers().addPlayerNumber(amount, type);
    }

    protected onDeath(): void {
        if (this.originalPlayer) {
            this.originalPlayer.health = this.health;
        }
        openMessageModal('YOU DIED');
    }

    copy(): Player {
        // Copies all stats (appeal, attack, armor, agility, acumen) and koallarbucks so town upgrades apply in next combat.
        const playerCopy = new Player({
            name: this.name,
            portrait: this.portrait,
            tooltip: this.tooltip,
            columnCount: this.columnCount,
            handSlotCount: this.handSlotCount,
            startingManaDiamonds: this.startingManaDiamonds,
            appeal: this.appeal,
            attack: this.attack,
            armor: this.armor,
            agility: this.agility,
            acumen: this.acumen,
            health: this.maxHealth,
            koallarbucks: this.koallarbucks,
            bytecoins: this.bytecoins,
            collection: this.collection.map(card => new SpellCard(
                card.rank,
                card.suit,
                card.name,
                card.description,
                card.effect,
                card.charges,
                card.keywords,
                card.flavorText
            )),
            manaDeck: { ...this.manaDeck },
            townStoreCards: [...this.townStoreCards],
            townTraderCards: [...this.townTraderCards],
        });
        playerCopy.spellDeck = [...this.spellDeck];
        playerCopy.level = this.level;
        playerCopy.scenarioRow = this.scenarioRow;
        playerCopy.scenarioColumn = this.scenarioColumn;
        playerCopy.health = this.health;
        playerCopy.manaDiamonds = this.startingManaDiamonds;
        playerCopy.dodge = this.dodge;
        playerCopy.block = this.block;
        playerCopy.bytecoins = this.bytecoins;
        return playerCopy;
    }
}

const koaSpellCards = spellCardsFromParams(starterCards);

export const koaParams: PlayerParams = {
    name: "Koa XIII",
    portrait: koaPortrait,
    tooltip: "Crown Prince Koa XIII of Koala Lumpur",

    columnCount: 6,
    handSlotCount: 2,

    appeal: 5,
    attack: 3,
    armor: 3,
    agility: 3,
    acumen: 3,

    health: 100,
    koallarbucks: 150,
    bytecoins: 0,

    collection: koaSpellCards,
    manaDeck: defaultManaCards(6),
};

const testSpellCards = spellCardsFromParams([...generalCards, ...debugCards]);

export const testCharacterParams: PlayerParams = {
    name: "DJ Testo",
    portrait: platypusPortrait,

    columnCount: 10,
    handSlotCount: 10,
    startingManaDiamonds: 1000,

    appeal: 0,
    attack: 0,
    armor: 0,
    agility: 0,
    acumen: 0,

    health: 1000,
    koallarbucks: 1000000,
    bytecoins: 0,

    collection: testSpellCards,
    manaDeck: defaultManaCards(0),
};

export default Player;
