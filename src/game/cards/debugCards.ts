import type { Combat } from "../../composables/useCombat";
import { Suit } from "../../models/Suit";
import { DamageType } from "../../models/DamageType";
import { Keyword } from "../keywords";

/**
 * Zero-rank Koala suit cards for testing. Cost 0 mana diamonds to cast.
 * Koala is a debug-only suit not used in normal gameplay.
 */

const debugKill = {
    rank: 0,
    suit: Suit.Koala,
    name: 'Debug Kill',
    description: 'Kills the enemy. (Debug)',
    keywords: [Keyword.Magic, Keyword.Ranged],
    effect: (combat: Combat) => {
        const { enemy } = combat;
        if (enemy) enemy.takeDamage(enemy.health, [DamageType.Ranged, DamageType.Magic]);
    },
};

export const debugCards = [
    debugKill,
];
