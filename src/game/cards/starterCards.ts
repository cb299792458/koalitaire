import type { Combat } from "../../composables/useCombat";
import { Suit } from "../../models/Card";
import { DamageType } from "../../models/DamageType";
import { Keyword } from "../keywords";

const shot = {
    rank: 3,
    suit: Suit.Wood,
    name: 'Shot',
    description: 'Deals 5 ranged damage, plus your Agility.',
    keywords: [Keyword.Ranged],
    effect: (combat: Combat) => {
        const { enemy, player } = combat;
        const damage = 5 + (player?.agility ?? 0);
        enemy.takeDamage(damage, [DamageType.Ranged]);
    },
    flavorText: "Less QQ, more Pew Pew.",
}

const scorch = {
    rank: 5,
    suit: Suit.Fire,
    name: 'Scorch',
    description: 'Deals 8 magic damage, plus your Arcane.',
    charges: 1,
    keywords: [Keyword.Magic],
    effect: (combat: Combat) => {
        const { enemy, player } = combat;
        const damage = 8 + (player?.arcane ?? 0);
        enemy.takeDamage(damage, [DamageType.Magic]);
    },
    flavorText: "Ow! Fire hot! -Leela, Fire indeed hot! -The Professy",
}

const shield = {
    rank: 2,
    suit: Suit.Earth,
    name: 'Shield',
    description: 'Gain 4 block, plus your Armor.',
    keywords: [Keyword.Block],
    effect: (combat: Combat) => {
        const { player } = combat;
        const block = 4 + (player?.armor ?? 0);
        player.gainBlock(block);
    },
    flavorText: "Tha block is hot (as well)! -Weezy",
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
    flavorText: "Flea and Ozzie would be proud.",
}

const study = {
    rank: 4,
    suit: Suit.Water,
    name: 'Study',
    description: 'Draw 3 cards.',
    keywords: [Keyword.Draw],
    effect: (combat: Combat) => {
        combat.drawCards(3, true);
    },
    flavorText: "What I should have been doing instead of making this game.",
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
