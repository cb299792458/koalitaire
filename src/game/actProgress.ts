import {
    CHAMPION_ENCOUNTER_ENEMIES,
    GUARDIAN_ENCOUNTER_ENEMIES,
    type EnemyConstructor,
} from "../models/enemies";

/** Stable id for a champion class (used for run tracking). */
function championClassId(C: EnemyConstructor): string {
    return C.name;
}

export function pickChampionForNewAct(defeatedChampionIds: readonly string[]): EnemyConstructor {
    const pool = CHAMPION_ENCOUNTER_ENEMIES.filter((C) => !defeatedChampionIds.includes(championClassId(C)));
    if (pool.length === 0) {
        return CHAMPION_ENCOUNTER_ENEMIES[Math.floor(Math.random() * CHAMPION_ENCOUNTER_ENEMIES.length)]!;
    }
    return pool[Math.floor(Math.random() * pool.length)]!;
}

/** All four guardians for the final act, in map order. */
export function pickGuardiansForFinalAct(): EnemyConstructor[] {
    return [...GUARDIAN_ENCOUNTER_ENEMIES];
}
