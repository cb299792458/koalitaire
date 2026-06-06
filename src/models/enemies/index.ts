import type Enemy from "../Enemy";

import {
    AlternatorEnemy,
    DwambatEnemy,
    FibonacciEnemy,
    FrighteningFishesEnemy,
    GnokkaEnemy,
    GruntEnemy,
    PlatypusEnemy,
    RatCallerEnemy,
} from "./regular";

import {
    BruteEnemy,
    BrawlerTwinsEnemy,
    HugeJackedRamEnemy,
    SquirrelfEnemy,
} from "./elites";

import {
    AnansiTheStoryWeaverChampionEnemy,
    ChronodoDragonChampionEnemy,
    CrocodileHunterChampionEnemy,
    GeckommanderChampionEnemy,
    LionOfTheNorthChampionEnemy,
    PenguinyuForceChampionEnemy,
} from "./champions";

import {
    ClubTheSealGuardianEnemy,
    DiamondTheStingrayGuardianEnemy,
    HeartTheBarracudaGuardianEnemy,
    SpadeTheFalconGuardianEnemy,
} from "./guardians";

import { KolanGraydadBossEnemy } from "./boss";

export type EnemyConstructor = new (act: number) => Enemy;

export { KolanGraydadBossEnemy };

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
    AlternatorEnemy,
    FibonacciEnemy,
    FrighteningFishesEnemy,
    RatCallerEnemy,
];

/** Elite encounter pool. */
export const ELITE_ENCOUNTER_ENEMIES: EnemyConstructor[] = [
    SquirrelfEnemy,
    BruteEnemy,
    BrawlerTwinsEnemy,
    HugeJackedRamEnemy,
];
