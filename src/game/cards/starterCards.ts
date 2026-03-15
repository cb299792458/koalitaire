import type { Combat } from "../../composables/useCombat";
import { Suit } from "../../models/Suit";
import { DamageType } from "../../models/DamageType";
import { Keyword } from "../keywords";

const shot = {
    rank: 3,
    suit: Suit.Wood,
    name: 'Shot',
    description: 'Deals 5 ranged damage.',
    keywords: [Keyword.Ranged, Keyword.Charges],
    effect: (combat: Combat) => {
        const { enemy } = combat;
        enemy.takeDamage(5, [DamageType.Ranged]);
    },
    flavorText: "Less QQ, more Pew Pew.",
    charges: 3,
}

const scorch = {
    rank: 5,
    suit: Suit.Fire,
    name: 'Scorch',
    description: 'Deals 8 magic damage.',
    keywords: [Keyword.Magic],
    effect: (combat: Combat) => {
        const { enemy } = combat;
        enemy.takeDamage(8, [DamageType.Magic]);
    },
    flavorText: "Ow! Fire hot! -Leela; Fire indeed hot! -The Professy",
}

const shield = {
    rank: 2,
    suit: Suit.Earth,
    name: 'Shield',
    description: 'Gain 4 block.',
    keywords: [Keyword.Block],
    effect: (combat: Combat) => {
        const { player } = combat;
        player.gainBlock(4);
    },
    flavorText: "Tha block is hot (as well)! -Weezy",
}

const slash = {
    rank: 1,
    suit: Suit.Metal,
    name: 'Slash',
    description: 'Deals 3 damage.',
    keywords: [Keyword.Attack],
    effect: (combat: Combat) => {
        const { enemy } = combat;
        enemy.takeDamage(3);
    },
    flavorText: "Flea and Ozzie would be proud.",
}

const study = {
    rank: 4,
    suit: Suit.Water,
    name: 'Study',
    description: 'Gain 3 mana diamonds.',
    keywords: [Keyword.ManaDiamond],
    effect: (combat: Combat) => {
        const { player } = combat;
        player.manaDiamonds += 3;
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
