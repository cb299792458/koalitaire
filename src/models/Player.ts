import Card, { SpellCard, type SpellCardParams } from "./Card";
import type { DamageType } from "./DamageType";
import { Suit, Suits } from "./Suit";
import Combatant from "./Combatant";
import type { DamageNumberType } from "./Combatant";
import type Cardifact from "./Cardifact";
import {
    type ActiveCombatStatus,
    CombatStatusId,
    COWED_INCOMING_FACTOR,
    KNACKERED_OUTGOING_FACTOR,
} from "../game/combatStatuses";
import type { CombatEventBus } from "../game/combatEvents";

import koaPortrait from "/player_portraits/koa.png";
import platypusPortrait from "/enemy_portraits/platypus.png";
import { openMessageModal } from "../stores/modalStore";
import useDamageNumbers from "../composables/useDamageNumbers";
// import { starterCards } from "../game/cards/starterCards";
import { basicCards } from "../game/cards/basicCards";
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

    /** Pre-generated trader cards (set at run start, not per visit). */
    townTraderCards?: SpellCardParams[];

    /** Permanent items; see {@link Cardifact.onAcquire} / {@link Cardifact.onCombatStart}. */
    cardifacts?: Cardifact[];

    /** Maximum cardifacts this character can hold for the run (character-specific). */
    maxCardifacts: number;
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

    /** Pre-generated trader cards (set at run start). */
    townTraderCards: SpellCardParams[];

    /** Permanent items (same instances as the run player; not duplicated per combat). */
    cardifacts: Cardifact[];

    /** Cap on {@link cardifacts} count for this character (set at run start from {@link PlayerParams}). */
    maxCardifacts: number;

    /** Reference to the original player when this is a combat copy; used to sync HP at combat end. */
    originalPlayer?: Player;

    /** Combat-only debuffs/buffs; duration counts down at end of each player turn. */
    combatStatuses: ActiveCombatStatus[] = [];
    /** Derived from {@link combatStatuses}; applied in {@link takeDamage} for incoming damage. */
    incomingDamageMultiplier: number = 1;
    /** Derived from {@link combatStatuses}; used by {@link Combat.damageEnemy} after the damage event. */
    outgoingDamageMultiplier: number = 1;

    /**
     * Set on the combat copy during {@link import("../composables/useCombat").Combat.start} for block/damage hooks.
     */
    combatEvents: CombatEventBus | null = null;

    constructor(params: PlayerParams) {
        const { name, portrait, tooltip, columnCount, handSlotCount, startingManaDiamonds = 0, appeal, attack, armor, agility, acumen, health, koallarbucks, bytecoins = 0, collection, manaDeck, townTraderCards, cardifacts = [], maxCardifacts } = params;
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

        this.townTraderCards = townTraderCards ?? pickRandom([...generalCards], 3);
        this.maxCardifacts = maxCardifacts;
        this.cardifacts = [...cardifacts].slice(0, this.maxCardifacts);
        this.recomputeCombatStatusMultipliers();
    }

    /** Add or refresh a combat status (refreshes duration if the same id already exists). */
    addCombatStatus(id: CombatStatusId, turns: number): void {
        const existing = this.combatStatuses.find((s) => s.id === id);
        if (existing) {
            existing.turnsRemaining = Math.max(existing.turnsRemaining, turns);
        } else {
            this.combatStatuses.push({ id, turnsRemaining: turns });
        }
        this.recomputeCombatStatusMultipliers();
    }

    /** Clears combat-only statuses (e.g. at the start of a new fight). */
    clearCombatStatuses(): void {
        this.combatStatuses = [];
        this.recomputeCombatStatusMultipliers();
    }

    /** Called at end of each player turn (from combat lifecycle). */
    tickCombatStatuses(): void {
        for (const s of this.combatStatuses) {
            s.turnsRemaining -= 1;
        }
        this.combatStatuses = this.combatStatuses.filter((s) => s.turnsRemaining > 0);
        this.recomputeCombatStatusMultipliers();
    }

    private recomputeCombatStatusMultipliers(): void {
        let incoming = 1;
        let outgoing = 1;
        for (const s of this.combatStatuses) {
            if (s.id === CombatStatusId.Cowed) incoming *= COWED_INCOMING_FACTOR;
            if (s.id === CombatStatusId.Knackered) outgoing *= KNACKERED_OUTGOING_FACTOR;
        }
        this.incomingDamageMultiplier = incoming;
        this.outgoingDamageMultiplier = outgoing;
    }

    takeDamage(amount: number, damageTypes: DamageType[] = []): void {
        const scaled = Math.max(0, Math.round(amount * this.incomingDamageMultiplier));
        super.takeDamage(scaled, damageTypes);
    }

    override gainBlock(amount: number): void {
        super.gainBlock(amount);
        if (amount > 0 && this.combatEvents) {
            void this.combatEvents.emit({ type: "playerGainedBlock", amount });
        }
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

    /** Slots left before hitting {@link maxCardifacts}. */
    get remainingCardifactSlots(): number {
        return Math.max(0, this.maxCardifacts - this.cardifacts.length);
    }

    /**
     * Adds a cardifact: runs {@link Cardifact.onAcquire} on the **run** player, then appends.
     * Returns false if at cap. (Uses {@link originalPlayer} when this is a combat copy.)
     */
    addCardifact(cardifact: Cardifact): boolean {
        const runPlayer = this.originalPlayer ?? this;
        if (runPlayer.cardifacts.length >= runPlayer.maxCardifacts) return false;
        cardifact.onAcquire(runPlayer);
        runPlayer.cardifacts.push(cardifact);
        return true;
    }

    /**
     * Removes by index on the **run** player (uses {@link originalPlayer} when this is a combat copy).
     * Runs {@link Cardifact.onRemove} before splicing.
     */
    removeCardifactAt(index: number): boolean {
        const runPlayer = this.originalPlayer ?? this;
        const list = runPlayer.cardifacts;
        const cardifact = list[index];
        if (!cardifact) return false;
        cardifact.onRemove(runPlayer);
        list.splice(index, 1);
        return true;
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
            townTraderCards: [...this.townTraderCards],
            cardifacts: this.cardifacts,
            maxCardifacts: this.maxCardifacts,
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
        playerCopy.combatStatuses = this.combatStatuses.map((s) => ({ ...s }));
        playerCopy.recomputeCombatStatusMultipliers();
        return playerCopy;
    }
}

// const koaSpellCards = spellCardsFromParams(starterCards);
const koaSpellCards = spellCardsFromParams(basicCards);

export const koaParams: PlayerParams = {
    name: "Koa XIII",
    portrait: koaPortrait,
    tooltip: "Crown Prince Koa XIII of Koala Lumpur",

    columnCount: 7,
    handSlotCount: 3,

    appeal: 5,
    attack: 3,
    armor: 3,
    agility: 3,
    acumen: 3,

    health: 100,
    koallarbucks: 150,
    bytecoins: 0,

    collection: koaSpellCards,
    manaDeck: defaultManaCards(9),

    maxCardifacts: 5,
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

    /** High cap so debug / test builds can equip many cardifacts. */
    maxCardifacts: 99,
};

export default Player;
