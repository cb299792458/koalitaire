import type Enemy from "./Enemy";
import type Player from "./Player";

export const suits: string[] = ["♥️",  "🌳", "⛊", "💎", "🪧",];

class Card {
    rank: number;
    suit: string;
    revealed: boolean = false;
    description: string;
    effect: (player: Player, enemy: Enemy) => void;
    
    defaultEffect (player: Player, enemy: Enemy): void {
        switch (this.suit) {
            case "🌳":
            case "🪧":
                console.log('asdfsadf')
                enemy.takeDamage(this.rank);
                if (!enemy.health) {
                    player.level += 1;
                    player.gold += 10;
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

    constructor(rank: number, suit: string, description?: string, effect?: (player: Player, enemy: Enemy) => void) {
        this.rank = rank;
        this.suit = suit;
        this.description = description || ``;
        this.effect = effect || this.defaultEffect;
    }
}

export default Card;

