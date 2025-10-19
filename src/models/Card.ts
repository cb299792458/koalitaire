import type Enemy from "./Enemy";
import type Player from "./Player";

export const suits: string[] = ["♥️",  "🌳", "⛊", "💎", "🪧",];

class Card {
    rank: number;
    suit: string;
    revealed: boolean = false;

    constructor(rank: number, suit: string) {
        this.rank = rank;
        this.suit = suit;
    }
    
    effect (player: Player, enemy: Enemy): void {
        enemy.health -= this.rank;
        if (enemy.health <= 0) {
            enemy.health = 0;
            player.level += 1;
            player.gold += 10;
        }
    }
}

export default Card;

