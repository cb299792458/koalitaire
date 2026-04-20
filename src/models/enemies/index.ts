import type Enemy from "../Enemy";
import AnansiTheStoryWeaverBossEnemy from "./bosses/AnansiTheStoryWeaverBossEnemy";
import ChronodoDragonBossEnemy from "./bosses/ChronodoDragonBossEnemy";
import CrocodileHunterBossEnemy from "./bosses/CrocodileHunterBossEnemy";
import GeckommanderBossEnemy from "./bosses/GeckommanderBossEnemy";
import PenguinyuForceBossEnemy from "./bosses/PenguinyuForceBossEnemy";
import LionOfTheNorthBossEnemy from "./bosses/LionOfTheNorthBossEnemy";
import AlternatorEnemy from "./AlternatorEnemy";
import BarrageEnemy from "./BarrageEnemy";
import BrawlerTwinsEnemy from "./BrawlerTwinsEnemy";
import BruteEnemy from "./BruteEnemy";
import DwambatEnemy from "./DwambatEnemy";
import FibonacciEnemy from "./FibonacciEnemy";
import FrighteningFishesEnemy from "./FrighteningFishesEnemy";
import GnokkaEnemy from "./GnokkaEnemy";
import GruntEnemy from "./GruntEnemy";
import MageEnemy from "./MageEnemy";
import PlatypusEnemy from "./PlatypusEnemy";
import RangerEnemy from "./RangerEnemy";
import RatCallerEnemy from "./RatCallerEnemy";
import SquirrelfEnemy from "./SquirrelfEnemy";
import TacticianEnemy from "./TacticianEnemy";

export type EnemyConstructor = new () => Enemy;

export {
    AlternatorEnemy,
    AnansiTheStoryWeaverBossEnemy,
    BarrageEnemy,
    BrawlerTwinsEnemy,
    BruteEnemy,
    ChronodoDragonBossEnemy,
    CrocodileHunterBossEnemy,
    DwambatEnemy,
    FibonacciEnemy,
    FrighteningFishesEnemy,
    GeckommanderBossEnemy,
    GnokkaEnemy,
    PenguinyuForceBossEnemy,
    GruntEnemy,
    LionOfTheNorthBossEnemy,
    MageEnemy,
    PlatypusEnemy,
    RangerEnemy,
    RatCallerEnemy,
    SquirrelfEnemy,
    TacticianEnemy,
};

/** Final scenario row; one constructor per run. */
export const BOSS_ENCOUNTER_ENEMIES: EnemyConstructor[] = [
    LionOfTheNorthBossEnemy,
    GeckommanderBossEnemy,
    PenguinyuForceBossEnemy,
    ChronodoDragonBossEnemy,
    AnansiTheStoryWeaverBossEnemy,
    CrocodileHunterBossEnemy,
];

/** Regular encounter pool (random scenario rows). */
export const RANDOM_ENCOUNTER_ENEMIES: EnemyConstructor[] = [
    PlatypusEnemy,
    DwambatEnemy,
    GnokkaEnemy,
    GruntEnemy,
    BrawlerTwinsEnemy,
    AlternatorEnemy,
    FibonacciEnemy,
    FrighteningFishesEnemy,
    RatCallerEnemy,
];

/** Elite encounter pool. */
export const ELITE_ENCOUNTER_ENEMIES: EnemyConstructor[] = [
    SquirrelfEnemy,
    BruteEnemy,
];
