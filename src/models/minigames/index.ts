import type { MinigameConstructor } from "../Minigame";
import BlackjackMinigame from "./BlackjackMinigame";
import MontyHallMinigame from "./MontyHallMinigame";
import ShellGameMinigame from "./ShellGameMinigame";
import HigherOrLowerMinigame from "./HigherOrLowerMinigame";
import MemoryMinigame from "./MemoryMinigame";
import RatscrewMinigame from "./RatscrewMinigame";
import WarMinigame from "./WarMinigame";

export type { MinigameConstructor } from "../Minigame";
export { isBlackjackMinigame } from "./BlackjackMinigame";
export { isHigherOrLowerMinigame } from "./HigherOrLowerMinigame";
export { isRatscrewMinigame } from "./RatscrewMinigame";
export { isMemoryMinigame } from "./MemoryMinigame";
export { isWarMinigame } from "./WarMinigame";
export { isMontyHallMinigame } from "./MontyHallMinigame";
export { isShellGameMinigame } from "./ShellGameMinigame";

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
