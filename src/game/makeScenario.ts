import Enemy, { platypusParams, dwambatParams, gnokkaParams, squirrelfParams, dingorcParams } from "../models/Enemy";

export type ScenarioEntry =
    | { enemy: Enemy }
    | { town: true }
    | null;

export default function makeScenario(): ScenarioEntry[] {
    return [
        null,
        { enemy: new Enemy(platypusParams) },
        { town: true },
        { enemy: new Enemy(dwambatParams) },
        { enemy: new Enemy(gnokkaParams) },
        { town: true },
        { enemy: new Enemy(squirrelfParams) },
        { enemy: new Enemy(dingorcParams) },
    ]
}
