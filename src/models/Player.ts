import Card, { SpellCard, type SpellCardParams } from "./Card";
import { Suit, Suits } from "./Card";
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

    /** Number of cards to draw at the start of each turn. Use Infinity to draw the whole deck. Defaults to 5. */
    handSize?: number;
    /** Number of tableau columns. Defaults to 6. */
    columnCount?: number;
    /** Mana diamonds at the start of combat. Defaults to 0. */
    startingManaDiamonds?: number;

    appeal: number;
    attack: number;
    armor: number;
    agility: number;
    arcane: number;

    health: number;
    gold: number;
    bytecoins?: number;

    /** All spell cards the player owns. */
    allCards: SpellCard[];
    /** Per-suit count of mana cards to bring to combat. For Koa, starts at 6 per suit. */
    manaCards: ManaCardsBySuit;
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

class Player extends Combatant {
    level: number = 1;

    handSize: number;
    columnCount: number;
    startingManaDiamonds: number;

    appeal: number;
    attack: number;
    agility: number;
    arcane: number;

    manaDiamonds: number = 0;
    gold: number;
    bytecoins: number = 0;

    /** All spell cards the player owns. */
    allCards: SpellCard[];
    /** Same length as allCards; true = card is in combat deck. */
    deckList: boolean[];
    /** Per-suit count of mana cards to bring to combat. */
    manaCards: ManaCardsBySuit;

    /** Reference to the original player when this is a combat copy; used to sync HP at combat end. */
    originalPlayer?: Player;

    constructor(params: PlayerParams) {
        const { name, portrait, tooltip, handSize = 5, columnCount = 6, startingManaDiamonds = 0, appeal, attack, armor, agility, arcane, health, gold, bytecoins = 0, allCards, manaCards } = params;
        super({ name, portrait, health, armor, tooltip });

        this.handSize = handSize;
        this.columnCount = columnCount;
        this.startingManaDiamonds = startingManaDiamonds;
        this.appeal = appeal;
        this.attack = attack;
        this.agility = agility;
        this.arcane = arcane;

        this.gold = gold;
        this.bytecoins = bytecoins;

        this.allCards = [...allCards];
        this.deckList = allCards.map(() => true);
        this.manaCards = { ...manaCards };
    }

    /** Build the full combat deck from spell cards (where deckList is true) plus mana cards. */
    getCombatDeck(): Card[] {
        const cards: Card[] = [];
        for (let i = 0; i < this.allCards.length; i++) {
            if (this.deckList[i]) {
                const spellCard = this.allCards[i]!;
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
            const count = this.manaCards[suit] ?? 0;
            for (let rank = 1; rank <= count; rank++) {
                cards.push(new Card(rank, suit));
            }
        }
        return cards;
    }

    /** Number of cards in the combat deck. */
    get deckSize(): number {
        const spellCount = this.deckList.filter(Boolean).length;
        const manaCount = Suits.reduce((sum, suit) => sum + (this.manaCards[suit] ?? 0), 0);
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
        // Copies all stats (appeal, attack, armor, agility, arcane) and gold so town upgrades apply in next combat.
        const playerCopy = new Player({
            name: this.name,
            portrait: this.portrait,
            tooltip: this.tooltip,
            handSize: this.handSize,
            columnCount: this.columnCount,
            startingManaDiamonds: this.startingManaDiamonds,
            appeal: this.appeal,
            attack: this.attack,
            armor: this.armor,
            agility: this.agility,
            arcane: this.arcane,
            health: this.maxHealth,
            gold: this.gold,
            bytecoins: this.bytecoins,
            allCards: this.allCards.map(card => new SpellCard(
                card.rank,
                card.suit,
                card.name,
                card.description,
                card.effect,
                card.charges,
                card.keywords,
                card.flavorText
            )),
            manaCards: { ...this.manaCards },
        });
        playerCopy.deckList = [...this.deckList];
        playerCopy.level = this.level;
        playerCopy.health = this.health;
        playerCopy.manaDiamonds = this.startingManaDiamonds;
        playerCopy.block = this.block;
        playerCopy.bytecoins = this.bytecoins;
        return playerCopy;
    }
}

const koaSpellCards = spellCardsFromParams(starterCards as SpellCardParams[]);

export const koaParams: PlayerParams = {
    name: "Koa XIII",
    portrait: koaPortrait,
    tooltip: "Crown Prince Koa XIII of Koala Lumpur",

    handSize: 5,
    columnCount: 7,

    appeal: 5,
    attack: 3,
    armor: 3,
    agility: 3,
    arcane: 3,

    health: 100,
    gold: 150,
    bytecoins: 0,

    allCards: koaSpellCards,
    manaCards: defaultManaCards(6),
};

const testSpellCards = spellCardsFromParams([...generalCards, ...debugCards] as SpellCardParams[]);

export const testCharacterParams: PlayerParams = {
    name: "DJ Testo",
    portrait: platypusPortrait,

    handSize: Infinity,
    columnCount: 1,
    startingManaDiamonds: 1000,

    appeal: 0,
    attack: 0,
    armor: 0,
    agility: 0,
    arcane: 0,

    health: 1000,
    gold: 1000000,
    bytecoins: 0,

    allCards: testSpellCards,
    manaCards: defaultManaCards(0),
};

export default Player;
