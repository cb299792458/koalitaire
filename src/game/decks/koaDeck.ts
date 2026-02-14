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
    description: 'Deals 5 damage plus bonus from Agility.',
    effect: (combat: Combat) => {
        const { enemy, player } = combat;
        const damage = 5 + (player?.agility ?? 0);
        enemy.takeDamage(damage);
    },
}

const fireball = {
    rank: 5,
    suit: Suit.Fire,
    name: 'Fireball',
    description: 'Deals 8 damage plus bonus from Arcane.',
    effect: (combat: Combat) => {
        const { enemy, player } = combat;
        const damage = 8 + (player?.arcane ?? 0);
        enemy.takeDamage(damage);
    },
}

const shield = {
    rank: 2,
    suit: Suit.Earth,
    name: 'Shield',
    description: 'Gain 4 block plus bonus from Armor.',
    effect: (combat: Combat) => {
        const { player } = combat;
        const block = 4 + (player?.armor ?? 0);
        player.gainBlock(block);
    },
}

const slash = {
    rank: 1,
    suit: Suit.Metal,
    name: 'Slash',
    description: 'Deals 3 damage plus bonus from Attack.',
    effect: (combat: Combat) => {
        const { enemy, player } = combat;
        const damage = 3 + (player?.attack ?? 0);
        enemy.takeDamage(damage);
    },
}

const study = {
    rank: 4,
    suit: Suit.Water,
    name: 'Study',
    description: 'Draw 3 cards.',
    effect: (combat: Combat) => {
        combat.drawCards(3, true);
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
