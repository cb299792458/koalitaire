import { openMessageModal } from "../stores/modalStore";
import type Enemy from "./Enemy";
import type Player from "./Player";

export const suits: string[] = ["♥️",  "🌳", "⛊", "💎", "🪧",];

class Card {
    rank: number;
    suit: string;
    revealed: boolean = false;
    name: string;
    description: string;
    effect: (player: Player, enemy: Enemy) => void;
    
    defaultEffect (player: Player, enemy: Enemy): void {
        switch (this.suit) {
            case "🌳":
            case "🪧":
                console.log('asdfsadf')
                enemy.takeDamage(this.rank);
                if (!enemy.health) {
                    openMessageModal(`You defeated ${enemy.name}!`);
                    player.level += 1;
                }
                break;
            case "♥️":
                player.health += this.rank;
                player.health = Math.min(player.health, player.maxHealth);
                break;
            case "⛊":
                player.block += this.rank;
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

    constructor(rank: number, suit: string, name?: string, description?: string, effect?: (player: Player, enemy: Enemy) => void) {
        this.rank = rank;
        this.suit = suit;
        this.name = name || this.defaultName();
        this.description = description || this.defaultDescription();
        this.effect = effect || this.defaultEffect;
    }
}

export default Card;

