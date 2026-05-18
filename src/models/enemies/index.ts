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
import KolanGraydadBossEnemy from "./boss/KolanGraydadBossEnemy";
import AlternatorEnemy from "./regular/AlternatorEnemy";
import BarrageEnemy from "./regular/BarrageEnemy";
import BrawlerTwinsEnemy from "./regular/BrawlerTwinsEnemy";
import DwambatEnemy from "./regular/DwambatEnemy";
import FibonacciEnemy from "./regular/FibonacciEnemy";
import FrighteningFishesEnemy from "./regular/FrighteningFishesEnemy";
import GnokkaEnemy from "./regular/GnokkaEnemy";
import GruntEnemy from "./regular/GruntEnemy";
import MageEnemy from "./regular/MageEnemy";
import PlatypusEnemy from "./regular/PlatypusEnemy";
import RangerEnemy from "./regular/RangerEnemy";
import RatCallerEnemy from "./regular/RatCallerEnemy";
import TacticianEnemy from "./regular/TacticianEnemy";
import BruteEnemy from "./elites/BruteEnemy";
import HugeJackedRamEnemy from "./elites/HugeJackedRamEnemy";
import SquirrelfEnemy from "./elites/SquirrelfEnemy";

export type EnemyConstructor = new (act: number) => Enemy;

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
    HugeJackedRamEnemy,
    KolanGraydadBossEnemy,
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
    HugeJackedRamEnemy,
];
