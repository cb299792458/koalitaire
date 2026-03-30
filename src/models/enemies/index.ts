import type Enemy from "../Enemy";
import AlternatorEnemy from "./AlternatorEnemy";
import BruteEnemy from "./BruteEnemy";
import DingorcEnemy from "./DingorcEnemy";
import DwambatEnemy from "./DwambatEnemy";
import FibonacciEnemy from "./FibonacciEnemy";
import GnokkaEnemy from "./GnokkaEnemy";
import GruntEnemy from "./GruntEnemy";
import PlatypusEnemy from "./PlatypusEnemy";
import SquirrelfEnemy from "./SquirrelfEnemy";

export type EnemyConstructor = new () => Enemy;

export { AlternatorEnemy, BruteEnemy, DingorcEnemy, DwambatEnemy, FibonacciEnemy, GnokkaEnemy, GruntEnemy, PlatypusEnemy, SquirrelfEnemy };

/** Regular encounter pool (random scenario rows). */
export const RANDOM_ENCOUNTER_ENEMIES: EnemyConstructor[] = [
    PlatypusEnemy,
    DwambatEnemy,
    GnokkaEnemy,
    GruntEnemy,
    AlternatorEnemy,
    FibonacciEnemy,
];

/** Elite encounter pool. */
export const ELITE_ENCOUNTER_ENEMIES: EnemyConstructor[] = [
    SquirrelfEnemy,
    BruteEnemy,
];
