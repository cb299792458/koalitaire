import type Enemy from "./Enemy";
import type Player from "./Player";

export const suits: string[] = ["♥️",  "🌳", "⛊", "💎", "🪧",];

class Card {
    rank: number;
    suit: string;
    revealed: boolean = false;
    description: string = "This card has not yet been implemented, playing it will deal one damage to the enemy.";
    effect: (player: Player, enemy: Enemy) => void;
    
    defaultEffect (player: Player, enemy: Enemy): void {
        enemy.health -= this.rank;
        if (enemy.health <= 0) {
            enemy.health = 0;
            player.level += 1;
            player.gold += 10;
        }
    }

    constructor(rank: number, suit: string, description?: string, effect?: (player: Player, enemy: Enemy) => void) {
        this.rank = rank;
        this.suit = suit;
        this.description = description || this.description;
        this.effect = effect || this.defaultEffect;
    }
}

export default Card;

