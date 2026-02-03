import { nextTick } from "vue";
import type { Combat } from "../composables/useCombat";

export const Suit = {
    Wood: "🪵",
    Fire : "🔥",
    Earth: "🪨",
    Metal: "🪙",
    Water: "💧",
} as const;
export type Suit = typeof Suit[keyof typeof Suit];
export const Suits: Suit[] = Object.values(Suit);
export interface BaseCardParams {
    name: string;
    description: string;
    effect: (combat: Combat) => void;
}
export interface CardParams extends BaseCardParams {
    rank: number;
    suit: Suit;
}

class Card {
    rank: number;
    suit: Suit;
    revealed: boolean = false;
    animation: string = '';
    name: string;
    description: string;
    effect: (combat: Combat) => void;
    animationTime: number = 1000; // Default animation time in milliseconds

    constructor(
        rank: number, suit: Suit, name: string, description: string, 
        effect: (combat: Combat) => void
    ) {
        this.rank = rank;
        this.suit = suit;
        this.name = name;
        this.description = description;
        this.effect = effect;
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
                    default:
                        this.animation = 'fly-up';
                }
            }, 50); // tiny delay to allow the card to appear in center

            // Reset after animation duration
            setTimeout(() => {
                this.animation = '';
            }, 50 + this.animationTime);
        });
    }

    // TODO: clean up this method, make animations enumerable
    animateBurn(): void {
        const burnAnimationTime = 1200; // Faster burn animation (1.2s)
        nextTick(() => {
            setTimeout(() => {
                this.animation = 'burn';
            }, 50);

            setTimeout(() => {
                this.animation = '';
            }, 50 + burnAnimationTime);
        });
    }

    animateTableauMove(): void {
        const tableauMoveTime = 400; // Quick animation for tableau moves (0.4s)
        nextTick(() => {
            setTimeout(() => {
                this.animation = 'tableau-move';
            }, 50);

            setTimeout(() => {
                this.animation = '';
            }, 50 + tableauMoveTime);
        });
    }

    animateDraw(): void {
        const drawAnimationTime = 500; // Animation for drawing cards (0.5s)
        nextTick(() => {
            setTimeout(() => {
                this.animation = 'draw';
            }, 50);

            setTimeout(() => {
                this.animation = '';
            }, 50 + drawAnimationTime);
        });
    }
}

export default Card;
