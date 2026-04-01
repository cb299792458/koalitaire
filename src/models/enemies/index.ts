import type Enemy from "../Enemy";
import AlternatorEnemy from "./AlternatorEnemy";
import BarrageEnemy from "./BarrageEnemy";
import BruteEnemy from "./BruteEnemy";
import DingorcEnemy from "./DingorcEnemy";
import DwambatEnemy from "./DwambatEnemy";
import FibonacciEnemy from "./FibonacciEnemy";
import GnokkaEnemy from "./GnokkaEnemy";
import GruntEnemy from "./GruntEnemy";
import MageEnemy from "./MageEnemy";
import PlatypusEnemy from "./PlatypusEnemy";
import RangerEnemy from "./RangerEnemy";
import RatCallerEnemy from "./RatCallerEnemy";
import SquirrelfEnemy from "./SquirrelfEnemy";
import TacticianEnemy from "./TacticianEnemy";

export type EnemyConstructor = new () => Enemy;

export { AlternatorEnemy, BarrageEnemy, BruteEnemy, DingorcEnemy, DwambatEnemy, FibonacciEnemy, GnokkaEnemy, GruntEnemy, MageEnemy, PlatypusEnemy, RangerEnemy, RatCallerEnemy, SquirrelfEnemy, TacticianEnemy };

/** Regular encounter pool (random scenario rows). */
export const RANDOM_ENCOUNTER_ENEMIES: EnemyConstructor[] = [
    PlatypusEnemy,
    DwambatEnemy,
    GnokkaEnemy,
    GruntEnemy,
    AlternatorEnemy,
    FibonacciEnemy,
    RatCallerEnemy,
];

/** Elite encounter pool. */
export const ELITE_ENCOUNTER_ENEMIES: EnemyConstructor[] = [
    SquirrelfEnemy,
    BruteEnemy,
];
