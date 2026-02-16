import type { Combat } from "../../composables/useCombat";
import { Suit } from "../../models/Card";
import { DamageType } from "../../models/DamageType";

const shot = {
    rank: 3,
    suit: Suit.Wood,
    name: 'Shot',
    description: 'Deals 5 ranged damage, plus your Agility.',
    effect: (combat: Combat) => {
        const { enemy, player } = combat;
        const damage = 5 + (player?.agility ?? 0);
        enemy.takeDamage(damage, [DamageType.Ranged]);
    },
}

const scorch = {
    rank: 5,
    suit: Suit.Fire,
    name: 'Scorch',
    description: 'Deals 8 magic damage, plus your Arcane.',
    charges: 1,
    effect: (combat: Combat) => {
        const { enemy, player } = combat;
        const damage = 8 + (player?.arcane ?? 0);
        enemy.takeDamage(damage, [DamageType.Magic]);
    },
}

const shield = {
    rank: 2,
    suit: Suit.Earth,
    name: 'Shield',
    description: 'Gain 4 block, plus your Armor.',
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
    description: 'Deals 3 damage, plus your Attack.',
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

export const starterCards = [
    shot,
    shot,
    scorch,
    scorch,
    slash,
    slash,
    shield,
    shield,
    study,
    study,
];
