/** Per-act multipliers for enemy HP, stats, and action damage. Acts above 5 use act 5. */
const ACT_SCALE_FACTORS: readonly [number, number, number, number, number] = [1, 2, 3, 6, 10];

export function actScaleFactor(act: number): number {
    const clamped = Math.min(5, Math.max(1, Math.floor(act)));
    return ACT_SCALE_FACTORS[clamped - 1]!;
}

export function scaleHealth(base: number, act: number): number {
    return Math.max(1, Math.round(base * actScaleFactor(act)));
}

export function scaleStat(base: number, act: number): number {
    return Math.round(base * actScaleFactor(act));
}

export function scaleDamage(base: number, act: number): number {
    return Math.max(0, Math.round(base * actScaleFactor(act)));
}

/** Scale summon HP and damage for the current act. */
export function scaleSummonTemplate<T extends { hp: number; damage: number }>(
    template: T,
    act: number
): T {
    return {
        ...template,
        hp: scaleHealth(template.hp, act),
        damage: scaleDamage(template.damage, act),
    };
}
