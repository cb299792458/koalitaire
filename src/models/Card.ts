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
        enemy.takeDamage(this.rank);
        if (!enemy.health) {
            player.level += 1;
            player.gold += 10;
        }
    }

    constructor(rank: number, suit: string, description?: string, effect?: (player: Player, enemy: Enemy) => void) {
        this.rank = rank;
        this.suit = suit;
        this.description = description || `NOT YET IMPLEMENTED\nDEALS ${this.rank} DAMAGE`;
        this.effect = effect || this.defaultEffect;
    }
}

export default Card;

