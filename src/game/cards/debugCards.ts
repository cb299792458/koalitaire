import type { Combat } from "../../composables/useCombat";
import { Suit } from "../../models/Card";
import { DamageType } from "../../models/DamageType";

/**
 * Zero-rank Koala suit cards for testing. Cost 0 mana crystals to cast.
 * Koala is a debug-only suit not used in normal gameplay.
 */

const debugKill = {
    rank: 0,
    suit: Suit.Koala,
    name: 'Debug Kill',
    description: 'Kills the enemy. (Debug)',
    effect: (combat: Combat) => {
        combat.enemy?.takeDamage(combat.enemy?.health ?? 0, [DamageType.Ranged, DamageType.Magic]);
    },
};

const debugHeal = {
    rank: 0,
    suit: Suit.Koala,
    name: 'Debug Heal',
    description: 'Fully heals the player. (Debug)',
    effect: (combat: Combat) => {
        combat.player?.gainHealth(combat.player?.maxHealth ?? 0);
    },
};


export const debugCards = [
    debugKill,
    debugHeal,
];
