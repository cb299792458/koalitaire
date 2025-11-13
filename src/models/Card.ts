import { nextTick } from "vue";
import type Enemy from "./Enemy";
import type Player from "./Player";
import type { GameState } from "../composables/useGameState";

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
    effect: (player: Player, enemy: Enemy, gameState: GameState) => void;
}

export interface CardParams extends BaseCardParams {
    rank: number;
    suit: Suit;
}

class Card {
    rank: number;
    suit: string;
    revealed: boolean = false;
    animation: string = '';
    name: string;
    description: string;
    effect: (player: Player, enemy: Enemy, gameState: GameState) => void;
    animationTime: number = 1000; // Default animation time in milliseconds

    constructor(
        rank: number, suit: string, name: string, description: string, 
        effect: (player: Player, enemy: Enemy, gameState: GameState) => void
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
                    case "🌳":
                    case "🪧":
                        this.animation = 'fly-right';
                        break;
                    case "♥️":
                    case "⛊":
                        this.animation = 'fly-left';
                        break;
                    case "💎":
                    default:
                        this.animation = 'fly-up';
                };
            }, 50); // tiny delay to allow the card to appear in center

            // Reset after animation duration
            setTimeout(() => {
                this.animation = '';
            }, 50 + this.animationTime);
        });
    }

    // TODO: clean up this method, make animations enumerable
    animateBurn(): void {
        nextTick(() => {
            setTimeout(() => {
                this.animation = 'burn';
            }, 50);

            setTimeout(() => {
                this.animation = '';
            }, 50 + this.animationTime);
        });
    }
}

export default Card;
