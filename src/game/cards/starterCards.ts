import type { Combat } from "../../composables/useCombat";
import type { SpellCardParams } from "../../models/Card";
import { Suit } from "../../models/Suit";
import { DamageType } from "../../models/DamageType";
import { Keyword } from "../keywords";

const shot: SpellCardParams = {
    rank: 3,
    suit: Suit.Wood,
    name: 'Shot',
    description: 'Deals 5 ranged damage.',
    keywords: [Keyword.Ranged, Keyword.Charges],
    effect: async (combat: Combat) => {
        await combat.damageEnemy(5, [DamageType.Ranged]);
    },
    flavorText: "Less QQ, more Pew Pew.",
    charges: 3,
}

const scorch: SpellCardParams = {
    rank: 5,
    suit: Suit.Fire,
    name: 'Scorch',
    description: 'Deals 8 magic damage.',
    keywords: [Keyword.Magic],
    effect: async (combat: Combat) => {
        await combat.damageEnemy(8, [DamageType.Magic]);
    },
    flavorText: "Ow! Fire hot! -Leela; Fire indeed hot! -The Professy",
}

const shield: SpellCardParams = {
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

const slash: SpellCardParams = {
    rank: 1,
    suit: Suit.Metal,
    name: 'Slash',
    description: 'Deals 3 damage.',
    keywords: [Keyword.Attack],
    effect: async (combat: Combat) => {
        await combat.damageEnemy(3);
    },
    flavorText: "Flea and Ozzie would be proud.",
}

const study: SpellCardParams = {
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

export const starterCards: SpellCardParams[] = [
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
