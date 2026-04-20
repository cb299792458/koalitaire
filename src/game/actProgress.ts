import { BOSS_ENCOUNTER_ENEMIES, type EnemyConstructor } from "../models/enemies";

/** Stable id for a boss class (used for run tracking). */
export function bossClassId(C: EnemyConstructor): string {
    return C.name;
}

export function pickBossForNewAct(defeatedBossIds: readonly string[]): EnemyConstructor {
    const pool = BOSS_ENCOUNTER_ENEMIES.filter((C) => !defeatedBossIds.includes(bossClassId(C)));
    if (pool.length === 0) {
        return BOSS_ENCOUNTER_ENEMIES[Math.floor(Math.random() * BOSS_ENCOUNTER_ENEMIES.length)]!;
    }
    return pool[Math.floor(Math.random() * pool.length)]!;
}

/** Boss classes the player has never defeated this run (for the Koala Lumpur gauntlet). */
export function bossIdsForGauntlet(defeatedBossIds: readonly string[]): string[] {
    return BOSS_ENCOUNTER_ENEMIES.filter((C) => !defeatedBossIds.includes(bossClassId(C))).map(bossClassId);
}

export function bossFromId(id: string): EnemyConstructor {
    const found = BOSS_ENCOUNTER_ENEMIES.find((C) => bossClassId(C) === id);
    if (!found) {
        throw new Error(`Unknown boss class id: ${id}`);
    }
    return found;
}

export function shuffleArray<T>(items: readonly T[]): T[] {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = a[i]!;
        a[i] = a[j]!;
        a[j] = t;
    }
    return a;
}
