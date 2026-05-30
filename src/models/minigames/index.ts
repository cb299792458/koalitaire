import type { MinigameConstructor } from "../Minigame";
import ArcheryContestMinigame from "./ArcheryContestMinigame";
import BlackjackMinigame from "./BlackjackMinigame";
import DiceDuelMinigame from "./DiceDuelMinigame";
import ShellGameMinigame from "./ShellGameMinigame";
import WagerOfWitsMinigame from "./WagerOfWitsMinigame";

export type { MinigameConstructor } from "../Minigame";
export { default as Minigame } from "../Minigame";
export {
    ArcheryContestMinigame,
    BlackjackMinigame,
    DiceDuelMinigame,
    ShellGameMinigame,
    WagerOfWitsMinigame,
};
export { isBlackjackMinigame, BLACKJACK_WINS_REQUIRED } from "./BlackjackMinigame";
export { isShellGameMinigame, createShuffledShellLayout } from "./ShellGameMinigame";
export type { ShellCardKind } from "./ShellGameMinigame";

export const MINIGAME_CONSTRUCTORS: MinigameConstructor[] = [
    // DiceDuelMinigame,
    ShellGameMinigame,
    BlackjackMinigame,
    // ArcheryContestMinigame,
    // WagerOfWitsMinigame,
];

export function pickRandomMinigameConstructor(): MinigameConstructor {
    return MINIGAME_CONSTRUCTORS[Math.floor(Math.random() * MINIGAME_CONSTRUCTORS.length)]!;
}
