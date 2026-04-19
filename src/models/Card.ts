import { nextTick } from "vue";
import type { Combat } from "../composables/useCombat";
import type { Suit } from "./Suit";
import { Keyword } from "../game/keywords";

/** Stagger before fly-left/right/up; spell cast resolution uses the same offset in useCombat. */
export const CAST_ANIMATION_DELAY_MS = 50;

function scheduleAnimation(card: Card, name: string, duration: number): void {
    nextTick(() => {
        setTimeout(() => { card.animation = name; }, CAST_ANIMATION_DELAY_MS);
        setTimeout(() => { card.animation = ''; }, CAST_ANIMATION_DELAY_MS + duration);
    });
}

export interface CardParams {
    rank: number;
    /** Null = no suit (not used for mana cards; spells may omit suit). */
    suit: Suit | null;
}

export interface SpellCardParams extends CardParams {
    name: string;
    description: string;
    effect: (combat: Combat) => void | Promise<void>;
    /** If set, shown on the card; decrements on use; card goes to trash when it reaches 0. */
    charges?: number;
    /** Keyword ids shown in tooltip with explanations. */
    keywords?: string[];
    /** Optional flavor text shown in italics at the bottom of the tooltip. */
    flavorText?: string;
    /**
     * Fly direction when cast (toward player = left, toward enemy = right).
     * If omitted, {@link SpellCard.getCastAnimationDirection} uses keywords.
     */
    castAnimationDirection?: 'left' | 'right' | 'up';
}

class Card {
    rank: number;
    suit: Suit | null;
    revealed: boolean = false;
    animation: string = '';
    /** Fly-out duration (ms) for {@link animate}; SingleCard cast fly transition uses the same value. */
    animationTime: number = 1000;
    isSpell: boolean = false;
    /** Keyword ids for tooltip explanations. Defaults to empty array. */
    keywords: string[] = [];
    /** Optional flavor text in tooltip (italics, after keywords). */
    flavorText?: string;

    constructor(rank: number, suit: Suit | null) {
        this.rank = rank;
        this.suit = suit;
    }

    /** Direction the card flies when cast. Overridden by SpellCard for keyword-based direction. */
    getCastAnimationDirection(): 'left' | 'right' | 'up' {
        return 'up';
    }

    animate(): void {
        this.animation = 'start-animation';

        nextTick(() => {
            setTimeout(() => {
                const dir = this.getCastAnimationDirection();
                this.animation = dir === 'left' ? 'fly-left' : dir === 'right' ? 'fly-right' : 'fly-up';
            }, CAST_ANIMATION_DELAY_MS);

            setTimeout(() => {
                this.animation = '';
            }, CAST_ANIMATION_DELAY_MS + this.animationTime);
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
        scheduleAnimation(this, 'move-to-mana', 220);
    }
}

const CAST_LEFT_KEYWORDS: string[] = [Keyword.Block, Keyword.Summon, Keyword.Heal, Keyword.ManaDiamond, Keyword.Draw];
const CAST_RIGHT_KEYWORDS: string[] = [
    Keyword.Attack,
    Keyword.Ranged,
    Keyword.Magic,
    Keyword.Piercing,
    Keyword.Backstab,
    Keyword.Aoe,
    Keyword.Knackered,
    Keyword.Crook,
    Keyword.Poisoned,
];

export class SpellCard extends Card {
    isSpell: boolean = true;
    name: string;
    description: string;
    effect: (combat: Combat) => void | Promise<void>;
    charges?: number;
    castAnimationDirection?: 'left' | 'right' | 'up';

    getCastAnimationDirection(): 'left' | 'right' | 'up' {
        if (this.castAnimationDirection) return this.castAnimationDirection;
        const kw = this.keywords ?? [];
        if (kw.some((k) => CAST_LEFT_KEYWORDS.includes(k))) return 'left';
        if (kw.some((k) => CAST_RIGHT_KEYWORDS.includes(k))) return 'right';
        return 'up';
    }

    constructor(
        rank: number,
        suit: Suit | null,
        name: string,
        description: string,
        effect: (combat: Combat) => void | Promise<void>,
        charges?: number,
        keywords?: string[],
        flavorText?: string,
        castAnimationDirection?: 'left' | 'right' | 'up'
    ) {
        super(rank, suit);
        this.name = name;
        this.description = description;
        this.effect = effect;
        this.charges = charges ?? Infinity;
        this.keywords = keywords ?? [];
        this.flavorText = flavorText;
        this.castAnimationDirection = castAnimationDirection;
    }
}

export default Card;
