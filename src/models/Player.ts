import Card, { SpellCard, type SpellCardParams } from "./Card";
import Combatant from "./Combatant";
import type { DamageNumberType } from "./Combatant";

import koaPortrait from "/player_portraits/koa.png";
import platypusPortrait from "/enemy_portraits/platypus.png";
import { openMessageModal } from "../stores/modalStore";
import koaDeck from "../game/decks/koaDeck";
import useDamageNumbers from "../composables/useDamageNumbers";
import { generalCards } from "../game/cards/generalCards";
import { debugCards } from "../game/cards/debugCards";

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

    makeDeck: () => Card[];
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

    deck: Card[];

    /** Reference to the original player when this is a combat copy; used to sync HP at combat end. */
    originalPlayer?: Player;

    constructor(params: PlayerParams) {
        const { name, portrait, tooltip, handSize = 5, columnCount = 6, startingManaDiamonds = 0, appeal, attack, armor, agility, arcane, health, gold, bytecoins = 0, makeDeck } = params;
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

        this.deck = makeDeck();
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
            makeDeck: () => this.deck.map(card => {
                // Preserve SpellCard instances
                if (card.isSpell) {
                    const spellCard = card as SpellCard;
                    return new SpellCard(
                        spellCard.rank,
                        spellCard.suit,
                        spellCard.name,
                        spellCard.description,
                        spellCard.effect,
                        spellCard.charges,
                        spellCard.keywords,
                        spellCard.flavorText
                    );
                } else {
                    return new Card(card.rank, card.suit);
                }
            })
        });
        playerCopy.level = this.level;
        playerCopy.health = this.health;
        playerCopy.manaDiamonds = this.startingManaDiamonds;
        playerCopy.block = this.block;
        playerCopy.bytecoins = this.bytecoins;
        return playerCopy;
    }
}

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

    makeDeck: () => {
        const deck: Card[] = [];
        for (const cardParams of koaDeck) {
            // Check if it's a SpellCard
            if ('effect' in cardParams) {
                const spellParams = cardParams as SpellCardParams;
                deck.push(new SpellCard(
                    spellParams.rank,
                    spellParams.suit,
                    spellParams.name,
                    spellParams.description,
                    spellParams.effect,
                    spellParams.charges,
                    spellParams.keywords,
                    spellParams.flavorText
                ));
            } else {
                // Mana card
                deck.push(new Card(cardParams.rank, cardParams.suit));
            }
        }
        return deck;
    }
};

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

    makeDeck: () => {
        const deck: Card[] = [];
        for (const cardParams of generalCards) {
            const spellParams = cardParams as SpellCardParams;
            deck.push(new SpellCard(
                spellParams.rank,
                spellParams.suit,
                spellParams.name,
                spellParams.description,
                spellParams.effect,
                spellParams.charges,
                spellParams.keywords,
                spellParams.flavorText
            ));
        }
        for (const cardParams of debugCards) {
            const spellParams = cardParams as SpellCardParams;
            deck.push(new SpellCard(
                spellParams.rank,
                spellParams.suit,
                spellParams.name,
                spellParams.description,
                spellParams.effect,
                spellParams.charges,
                spellParams.keywords,
                spellParams.flavorText
            ));
        }
        return deck;
    }
};

export default Player;
