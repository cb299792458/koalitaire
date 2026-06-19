import type { MinigameConstructor } from "../Minigame";
import BlackjackMinigame from "./BlackjackMinigame";
import MontyHallMinigame from "./MontyHallMinigame";
import ShellGameMinigame from "./ShellGameMinigame";
import HigherOrLowerMinigame from "./HigherOrLowerMinigame";
import MemoryMinigame from "./MemoryMinigame";
import RatscrewMinigame from "./RatscrewMinigame";
import WarMinigame from "./WarMinigame";

export type { MinigameConstructor } from "../Minigame";

export const MINIGAME_CONSTRUCTORS: MinigameConstructor[] = [
    ShellGameMinigame,
    BlackjackMinigame,
    MontyHallMinigame,
    HigherOrLowerMinigame,
    MemoryMinigame,
    RatscrewMinigame,
    WarMinigame,
];

export function pickRandomMinigameConstructor(): MinigameConstructor {
    return MINIGAME_CONSTRUCTORS[
        Math.floor(Math.random() * MINIGAME_CONSTRUCTORS.length)
    ]!;
}
