import type Enemy from "../Enemy";
import AnansiTheStoryWeaverChampionEnemy from "./champions/AnansiTheStoryWeaverChampionEnemy";
import ChronodoDragonChampionEnemy from "./champions/ChronodoDragonChampionEnemy";
import CrocodileHunterChampionEnemy from "./champions/CrocodileHunterChampionEnemy";
import GeckommanderChampionEnemy from "./champions/GeckommanderChampionEnemy";
import PenguinyuForceChampionEnemy from "./champions/PenguinyuForceChampionEnemy";
import LionOfTheNorthChampionEnemy from "./champions/LionOfTheNorthChampionEnemy";
import DiamondTheStingrayGuardianEnemy from "./guardians/DiamondTheStingrayGuardianEnemy";
import ClubTheSealGuardianEnemy from "./guardians/ClubTheSealGuardianEnemy";
import HeartTheBarracudaGuardianEnemy from "./guardians/HeartTheBarracudaGuardianEnemy";
import SpadeTheFalconGuardianEnemy from "./guardians/SpadeTheFalconGuardianEnemy";
import KoalaKingFinalBossEnemy from "./boss/KoalaKingFinalBossEnemy";
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
    AnansiTheStoryWeaverChampionEnemy,
    BarrageEnemy,
    BrawlerTwinsEnemy,
    BruteEnemy,
    ChronodoDragonChampionEnemy,
    CrocodileHunterChampionEnemy,
    DwambatEnemy,
    FibonacciEnemy,
    FrighteningFishesEnemy,
    GeckommanderChampionEnemy,
    GnokkaEnemy,
    KoalaKingFinalBossEnemy,
    PenguinyuForceChampionEnemy,
    DiamondTheStingrayGuardianEnemy,
    ClubTheSealGuardianEnemy,
    HeartTheBarracudaGuardianEnemy,
    SpadeTheFalconGuardianEnemy,
    GruntEnemy,
    LionOfTheNorthChampionEnemy,
    MageEnemy,
    PlatypusEnemy,
    RangerEnemy,
    RatCallerEnemy,
    SquirrelfEnemy,
    TacticianEnemy,
};

/** Final scenario row; one constructor per run. */
export const CHAMPION_ENCOUNTER_ENEMIES: EnemyConstructor[] = [
    LionOfTheNorthChampionEnemy,
    GeckommanderChampionEnemy,
    PenguinyuForceChampionEnemy,
    ChronodoDragonChampionEnemy,
    AnansiTheStoryWeaverChampionEnemy,
    CrocodileHunterChampionEnemy,
];

/** Final act guardians (fought in order, one map node each). */
export const GUARDIAN_ENCOUNTER_ENEMIES: EnemyConstructor[] = [
    DiamondTheStingrayGuardianEnemy,
    ClubTheSealGuardianEnemy,
    HeartTheBarracudaGuardianEnemy,
    SpadeTheFalconGuardianEnemy,
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
