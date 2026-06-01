import type { MinigameConstructor } from "../Minigame";
import BlackjackMinigame from "./BlackjackMinigame";
import MontyHallMinigame from "./MontyHallMinigame";
import ShellGameMinigame from "./ShellGameMinigame";
import HigherOrLowerMinigame from "./HigherOrLowerMinigame";
import MemoryMinigame from "./MemoryMinigame";
import RatscrewMinigame from "./RatscrewMinigame";
import WarMinigame from "./WarMinigame";

export type { MinigameConstructor } from "../Minigame";
export { default as Minigame } from "../Minigame";
export {
    BlackjackMinigame,
    MontyHallMinigame,
    ShellGameMinigame,
    HigherOrLowerMinigame,
    MemoryMinigame,
    RatscrewMinigame,
    WarMinigame,
};
export { isBlackjackMinigame, BLACKJACK_WINS_REQUIRED } from "./BlackjackMinigame";
export {
    isHigherOrLowerMinigame,
    HIGHER_LOWER_WINS_REQUIRED,
} from "./HigherOrLowerMinigame";
export {
    isRatscrewMinigame,
    RATSCREW_MISS_DAMAGE_BASE,
    RATSCREW_FALSE_SLAP_DAMAGE_BASE,
    RATSCREW_CREW_LABEL,
} from "./RatscrewMinigame";
export { isMemoryMinigame, MEMORY_MISMATCH_DAMAGE_BASE } from "./MemoryMinigame";
export { isWarMinigame, WAR_WINS_REQUIRED } from "./WarMinigame";
export {
    isMontyHallMinigame,
    createMontyLayout,
    pickDoorToReveal,
    switchDoorIndex,
} from "./MontyHallMinigame";
export type { MontyCardKind } from "./MontyHallMinigame";
export { isShellGameMinigame, createShuffledShellLayout } from "./ShellGameMinigame";
export type { ShellCardKind } from "./ShellGameMinigame";

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
