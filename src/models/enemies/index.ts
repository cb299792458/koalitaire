import type Enemy from "../Enemy";
import DingorcEnemy from "./DingorcEnemy";
import DwambatEnemy from "./DwambatEnemy";
import GnokkaEnemy from "./GnokkaEnemy";
import PlatypusEnemy from "./PlatypusEnemy";
import SquirrelfEnemy from "./SquirrelfEnemy";

export type EnemyConstructor = new () => Enemy;

export { DingorcEnemy, DwambatEnemy, GnokkaEnemy, PlatypusEnemy, SquirrelfEnemy };

/** Regular encounter pool (random scenario rows). */
export const RANDOM_ENCOUNTER_ENEMIES: EnemyConstructor[] = [
    PlatypusEnemy,
    DwambatEnemy,
    GnokkaEnemy,
];
