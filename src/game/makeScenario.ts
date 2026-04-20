import { ELITE_ENCOUNTER_ENEMIES, RANDOM_ENCOUNTER_ENEMIES, type EnemyConstructor } from "../models/enemies";
import { pickBossForNewAct } from "./actProgress";
import type { Event } from "../models/Event";
import { events } from "../models/Event";

export type ScenarioEntry =
    | { enemy: EnemyConstructor }
    | { elite: EnemyConstructor }
    | { boss: EnemyConstructor }
    | { town: true }
    | { event: Event }
    | null;

const ROW_COUNT = 13;

/** Row lengths for the diamond: 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1 */
const DIAMOND_ROW_LENGTHS = [1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1] as const;

function pickRandomEvent(): Event {
    return events[Math.floor(Math.random() * events.length)]!;
}

function pickRandomEnemyFrom(pool: EnemyConstructor[]): EnemyConstructor {
    return pool[Math.floor(Math.random() * pool.length)]!;
}

export interface MakeScenarioOptions {
    /** Boss for the bottom row; if omitted, picks one not yet defeated this run (or any if the pool is empty). */
    lastRowBoss?: EnemyConstructor;
}

function pickRandomEntry(): NonNullable<ScenarioEntry> {
    const roll = Math.random();
    if (roll < 0.65) return { enemy: pickRandomEnemyFrom(RANDOM_ENCOUNTER_ENEMIES) };
    if (roll < 0.8) return { elite: pickRandomEnemyFrom(ELITE_ENCOUNTER_ENEMIES) };
    if (roll < 0.9) return { town: true };
    return { event: pickRandomEvent() };
}

export default function makeScenario(options?: MakeScenarioOptions): ScenarioEntry[][] {
    const scenario: ScenarioEntry[][] = [];

    for (let row = 0; row < ROW_COUNT; row++) {
        const length = DIAMOND_ROW_LENGTHS[row] ?? 1;
        const rowEntries: ScenarioEntry[] = [];

        if (row === 0) {
            rowEntries.push(null);
        } else if (row === ROW_COUNT - 1) {
            rowEntries.push({
                boss: options?.lastRowBoss ?? pickBossForNewAct([]),
            });
        } else {
            for (let col = 0; col < length; col++) {
                rowEntries.push(pickRandomEntry());
            }
        }

        scenario.push(rowEntries);
    }

    return scenario;
}

export { DIAMOND_ROW_LENGTHS };

/** Get valid (row, col) options for the next row from current position. */
export function getNextRowOptions(currentRow: number, currentCol: number): { row: number; col: number }[] {
    const nextRow = currentRow + 1;
    if (nextRow >= ROW_COUNT) return [];
    const nextLen = DIAMOND_ROW_LENGTHS[nextRow]!;
    const options: { row: number; col: number }[] = [];
    if (currentRow < 6) {
        // Expanding: can go to col or col+1
        for (const c of [currentCol, currentCol + 1]) {
            if (c >= 0 && c < nextLen) options.push({ row: nextRow, col: c });
        }
    } else {
        // Contracting: can go to col-1 or col
        for (const c of [currentCol - 1, currentCol]) {
            if (c >= 0 && c < nextLen) options.push({ row: nextRow, col: c });
        }
    }
    return options;
}
