import { nextTick } from "vue";
import { openMessageModal } from "../stores/modalStore";
import type Enemy from "./Enemy";
import type Player from "./Player";
import type { GameState } from "../composables/useGameState";
import useDamageNumbers from "../composables/useDamageNumbers";

export const suits: string[] = [
    "♥️",  
    "🌳", 
    "⛊", 
    "💎", 
    "🪧",
];

export interface CardParams {
    rank: number;
    suit: string;
    name?: string;
    description?: string;
    effect?: (player: Player, enemy: Enemy, gameState: GameState) => void;
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
    
    defaultEffect (player: Player, enemy: Enemy, _gameState: GameState): void {
        const damageNumbers = useDamageNumbers();
        
        switch (this.suit) {
            case "🌳":
            case "🪧":
                enemy.takeDamage(this.rank);
                if (!enemy.health) {
                    openMessageModal(`You defeated ${enemy.name}!`);
                    player.level += 1;
                }
                break;
            case "♥️":
                const previousHealth = player.health;
                player.health += this.rank;
                player.health = Math.min(player.health, player.maxHealth);
                const healAmount = player.health - previousHealth;
                if (healAmount > 0) {
                    // Small delay to ensure it appears after card animation
                    setTimeout(() => {
                        damageNumbers.addPlayerNumber(healAmount, 'heal');
                    }, 50);
                }
                break;
            case "⛊":
                player.block += this.rank;
                damageNumbers.addPlayerNumber(this.rank, 'block-gain');
                break;
            case "💎":
                player.gold += this.rank;
                break;
            default:
                console.warn(`Unknown suit: ${this.suit}`);
        }
    }

    defaultName(): string {
        switch (this.suit) {
            case "🌳":
                return 'Bow Shot'
            case "🪧":
                return `Melee Strike`;
            case "♥️":
                return `Cure Wounds`;
            case "⛊":
                return `Shield Block`;
            case "💎":
                return `Dig for Gold`;
            default:
                return `${this.rank}${this.suit}`;
        }
    }

    defaultDescription(): string {
        switch (this.suit) {
            case "🌳":
            case "🪧":
                return `Deal ${this.rank} damage to an enemy.`;
            case "♥️":
                return `Heal ${this.rank} health.`;
            case "⛊":
                return `Gain ${this.rank} block.`;
            case "💎":
                return `Gain ${this.rank} gold.`;
            default:
                return `Unknown card effect.`;
        }
    }

    constructor(rank: number, suit: string, name?: string, description?: string, effect?: (player: Player, enemy: Enemy, gameState: GameState) => void) {
        this.rank = rank;
        this.suit = suit;
        this.name = name || this.defaultName();
        this.description = description || this.defaultDescription();
        this.effect = effect || this.defaultEffect;
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

