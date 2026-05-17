import {
    CHAMPION_ENCOUNTER_ENEMIES,
    GUARDIAN_ENCOUNTER_ENEMIES,
    type EnemyConstructor,
} from "../models/enemies";

/** Stable id for a champion class (used for run tracking). */
export function championClassId(C: EnemyConstructor): string {
    return C.name;
}

/** Stable id for a guardian class (used for run tracking). */
export function guardianClassId(C: EnemyConstructor): string {
    return C.name;
}

export function pickChampionForNewAct(defeatedChampionIds: readonly string[]): EnemyConstructor {
    const pool = CHAMPION_ENCOUNTER_ENEMIES.filter((C) => !defeatedChampionIds.includes(championClassId(C)));
    if (pool.length === 0) {
        return CHAMPION_ENCOUNTER_ENEMIES[Math.floor(Math.random() * CHAMPION_ENCOUNTER_ENEMIES.length)]!;
    }
    return pool[Math.floor(Math.random() * pool.length)]!;
}

/** Champion classes the player has never defeated this run. */
export function championIdsForGauntlet(defeatedChampionIds: readonly string[]): string[] {
    return CHAMPION_ENCOUNTER_ENEMIES.filter((C) => !defeatedChampionIds.includes(championClassId(C))).map(championClassId);
}

export function championFromId(id: string): EnemyConstructor {
    const found = CHAMPION_ENCOUNTER_ENEMIES.find((C) => championClassId(C) === id);
    if (!found) {
        throw new Error(`Unknown champion class id: ${id}`);
    }
    return found;
}

/** All four guardians for the final act, in map order. */
export function pickGuardiansForFinalAct(): EnemyConstructor[] {
    return [...GUARDIAN_ENCOUNTER_ENEMIES];
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
