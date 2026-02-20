import Enemy, { platypusParams, dwambatParams, gnokkaParams, squirrelfParams, dingorcParams } from "../models/Enemy";
import type { Event } from "../models/Event";
import { events } from "../models/Event";

export type ScenarioEntry =
    | { enemy: Enemy }
    | { town: true }
    | { event: Event }
    | null;

function pickRandomEvent(): Event {
    return events[Math.floor(Math.random() * events.length)]!;
}

export default function makeScenario(): ScenarioEntry[] {
    return [
        null,
        { enemy: new Enemy(platypusParams) },
        { event: pickRandomEvent() },
        { town: true },
        { enemy: new Enemy(dwambatParams) },
        { enemy: new Enemy(gnokkaParams) },
        { event: pickRandomEvent() },
        { town: true },
        { enemy: new Enemy(squirrelfParams) },
        { enemy: new Enemy(dingorcParams) },
    ]
}
