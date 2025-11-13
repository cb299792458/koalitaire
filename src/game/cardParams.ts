import type { GameState } from "../composables/useGameState";
import { Suit } from "../models/Card";
import type Enemy from "../models/Enemy";
import type Player from "../models/Player";

const allCards = {
    [Suit.Wood]: [
        {
            name: "Crappy Shot",
            description: "Deals 1 damage (not affected by agility)",
            effect: (_player: Player, enemy: Enemy) => enemy.takeDamage(1),
        },
    ],
    [Suit.Fire]: [
        {
            name: "Crappy Strike",
            description: "Deals 1 damage (not affected by attack)",
            effect: (_player: Player, enemy: Enemy) => enemy.takeDamage(1),
        },
    ],
    [Suit.Earth]: [
        {
            name: "Crappy Block",
            description: "Gain 1 block (not affected by armor)",
            effect: (player: Player) => player.gainBlock(1),
        },
    ],
    [Suit.Metal]: [
        {
            name: "Condense Mana",
            description: "Gain 1 Mana Diamond",
            effect: (player: Player) => player.manaDiamonds += 1,
        },
    ],
    [Suit.Water]: [
        {
            name: "Crappy Draw",
            description: "Draw 1 card",
            effect: (_player: Player, _enemy: Enemy, gameState: GameState) => gameState.drawCards(1),
        },
    ],
}

export default allCards;
