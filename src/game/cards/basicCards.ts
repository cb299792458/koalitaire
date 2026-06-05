import type { Combat } from "../../composables/useCombat";
import type { SpellCardParams } from "../../models/Card";
import { DamageType } from "../../models/DamageType";
import { Suit } from "../../models/Suit";
import { CombatStatusId } from "../combatStatuses";
import { Keyword } from "../keywords";


const basicAttack: SpellCardParams = {
    rank: 0,
    suit: null,
    name: 'Basic Attack',
    description: 'Deals 5 damage.',
    keywords: [Keyword.Attack],
    castAnimationDirection: 'right',
    effect: async (combat: Combat) => {
        await combat.damageEnemy(5);
    },
}

const basicBlock: SpellCardParams = {
    rank: 0,
    suit: null,
    name: 'Basic Block',
    description: 'Gains 5 block.',
    keywords: [Keyword.Block],
    castAnimationDirection: 'left',
    effect: (combat: Combat) => {
        combat.player.gainBlock(5);
    },
}

const bowShot: SpellCardParams = {
    rank: 1,
    suit: Suit.Wood,
    name: 'Bow Shot',
    description: 'Deals 10 ranged damage. (Ignores enemy summons)',
    keywords: [Keyword.Ranged],
    castAnimationDirection: 'right',
    effect: async (combat: Combat) => {
        await combat.damageEnemy(10, [DamageType.Ranged]);
    },
}

const fireball: SpellCardParams = {
    rank: 1,
    suit: Suit.Fire,
    name: 'Fireball',
    description: 'Deals 10 magic damage. (Ignores enemy block)',
    keywords: [Keyword.Magic],
    castAnimationDirection: 'right',
    effect: async (combat: Combat) => {
        await combat.damageEnemy(10, [DamageType.Magic]);
    },
}

const groundPound: SpellCardParams = {
    rank: 1,
    suit: Suit.Earth,
    name: 'Ground Pound',
    description: 'Deals 5 AoE damage. (Damages the enemy and their summons)',
    keywords: [Keyword.Aoe],
    castAnimationDirection: 'right',
    effect: async (combat: Combat) => {
        await combat.damageEnemy(5, [DamageType.Aoe]);
    },
}

const precisionStrike: SpellCardParams = {
    rank: 1,
    suit: Suit.Metal,
    name: 'Precision Strike',
    description: 'Deals five damage, plus your Attack.',
    keywords: [Keyword.Attack],
    castAnimationDirection: 'right',
    effect: async (combat: Combat) => {
        await combat.damageEnemy(5 + (combat.player.attack ?? 0));
    },
}

const poisonSpray: SpellCardParams = {
    rank: 1,
    suit: Suit.Water,
    name: 'Poison Spray',
    description: 'Applies 5 Poisoned to the enemy.',
    keywords: [Keyword.Poisoned],
    castAnimationDirection: 'right',
    effect: (combat: Combat) => {
        combat.enemy?.addCombatStatus(CombatStatusId.Poisoned, 5);
    },
}

export const starterCards: SpellCardParams[] = [
    bowShot,
    fireball,
    groundPound,
    precisionStrike,
    poisonSpray,
];

/** Pick `count` distinct random options from {@link starterCards} for the run-start choice. */
export function pickRandomStarterCardChoices(count: number): SpellCardParams[] {
    const shuffled = [...starterCards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

export const basicCards: SpellCardParams[] = [
    basicAttack,
    basicAttack,
    basicAttack,
    basicBlock,
    basicBlock,
]
