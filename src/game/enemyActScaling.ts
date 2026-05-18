/** Multiplier applied to enemy base stats and action damage from act 1 upward. */
export function actScaleFactor(act: number): number {
    return 1 + 0.2 * Math.max(0, act - 1);
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
