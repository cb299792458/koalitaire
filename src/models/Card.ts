import { nextTick } from "vue";
import type { Combat } from "../composables/useCombat";
import { Suit } from "./Suit";

const ANIMATION_DELAY = 50;

function scheduleAnimation(card: Card, name: string, duration: number): void {
    nextTick(() => {
        setTimeout(() => { card.animation = name; }, ANIMATION_DELAY);
        setTimeout(() => { card.animation = ''; }, ANIMATION_DELAY + duration);
    });
}

export interface CardParams {
    rank: number;
    suit: Suit;
}

export interface SpellCardParams extends CardParams {
    name: string;
    description: string;
    effect: (combat: Combat) => void;
    /** If set, shown on the card; decrements on use; card goes to trash when it reaches 0. */
    charges?: number;
    /** Keyword ids shown in tooltip with explanations. */
    keywords?: string[];
    /** Optional flavor text shown in italics at the bottom of the tooltip. */
    flavorText?: string;
}

class Card {
    rank: number;
    suit: Suit;
    revealed: boolean = false;
    animation: string = '';
    animationTime: number = 1000; // Default animation time in milliseconds
    isSpell: boolean = false;
    /** Keyword ids for tooltip explanations. Defaults to empty array. */
    keywords: string[] = [];
    /** Optional flavor text in tooltip (italics, after keywords). */
    flavorText?: string;

    constructor(rank: number, suit: Suit) {
        this.rank = rank;
        this.suit = suit;
    }

    animate(): void {
        this.animation = 'start-animation';

        nextTick(() => {
            setTimeout(() => {
                switch (this.suit) {
                    case Suit.Wood:
                    case Suit.Earth:
                        this.animation = 'fly-right';
                        break;
                    case Suit.Fire:
                    case Suit.Metal:
                        this.animation = 'fly-left';
                        break;
                    case Suit.Water:
                    case Suit.Koala:
                    default:
                        this.animation = 'fly-up';
                }
            }, ANIMATION_DELAY);

            setTimeout(() => {
                this.animation = '';
            }, ANIMATION_DELAY + this.animationTime);
        });
    }

    animateBurn(): void {
        scheduleAnimation(this, 'burn', 1200);
    }

    animateTableauMove(): void {
        scheduleAnimation(this, 'tableau-move', 400);
    }

    animateDraw(): void {
        scheduleAnimation(this, 'draw', 500);
    }

    animateMoveToMana(): void {
        scheduleAnimation(this, 'move-to-mana', 350);
    }
}

export class SpellCard extends Card {
    isSpell: boolean = true;
    name: string;
    description: string;
    effect: (combat: Combat) => void;
    charges?: number;

    constructor(
        rank: number,
        suit: Suit,
        name: string,
        description: string,
        effect: (combat: Combat) => void,
        charges?: number,
        keywords?: string[],
        flavorText?: string
    ) {
        super(rank, suit);
        this.name = name;
        this.description = description;
        this.effect = effect;
        this.charges = charges ?? Infinity;
        this.keywords = keywords ?? [];
        this.flavorText = flavorText;
    }
}

export default Card;
