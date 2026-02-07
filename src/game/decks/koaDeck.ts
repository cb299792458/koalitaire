import type { Combat } from "../../composables/useCombat";
import { Suit, Suits, type CardParams } from "../../models/Card";
// import allCards from "../cardParams";

// const koaDeck: CardParams[] = Object.entries(allCards).map(([suit, cards]) => {
//     return cards.map((card, rank) => ({
//         ...card,
//         suit: suit as Suit,
//         rank,
//     }));
// }).flat();

const manaCards =  [1, 2, 3, 4, 5, 6,].map((rank) => Suits.map((suit: Suit) => ({
    rank,
    suit,
}))).flat();

const shot = {
    rank: 3,
    suit: Suit.Wood,
    name: 'Shot',
    description: 'Deals 5 ranged damage to the enemy.',
    effect: (combat: Combat) => {
        const { enemy } = combat;
        enemy.takeDamage(5);
    },
}

const fireball = {
    rank: 5,
    suit: Suit.Fire,
    name: 'Fireball',
    description: 'Deals 8 magic damage to the enemy.',
    effect: (combat: Combat) => {
        const { enemy } = combat;
        enemy.takeDamage(5);
    },
}

const shield = {
    rank: 2,
    suit: Suit.Earth,
    name: 'Shield',
    description: 'Gain 4 block.',
    effect: (combat: Combat) => {
        const { player } = combat;
        player.gainBlock(5);
    },
}

const slash = {
    rank: 1,
    suit: Suit.Metal,
    name: 'Slash',
    description: 'Deals 3 melee damage to the enemy.',
    effect: (combat: Combat) => {
        const { enemy } = combat;
        enemy.takeDamage(3);
    },
}

const study = {
    rank: 4,
    suit: Suit.Water,
    name: 'Study',
    description: 'Draw 3 cards.',
    effect: (combat: Combat) => {
        combat.drawCards(2, true);
    },
}

const spellCards = [
    shot,
    shot,
    fireball,
    fireball,
    slash,
    slash,
    shield,
    shield,
    study,
    study,
];

const koaDeck: CardParams[] = [...manaCards, ...spellCards];

export default koaDeck;
