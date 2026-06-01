import type Minigame from "../models/Minigame";
import BlackjackMinigame from "../models/minigames/BlackjackMinigame";
import HigherOrLowerMinigame from "../models/minigames/HigherOrLowerMinigame";
import MemoryMinigame from "../models/minigames/MemoryMinigame";
import RatscrewMinigame from "../models/minigames/RatscrewMinigame";
import WarMinigame from "../models/minigames/WarMinigame";
import type Player from "../models/Player";
import { resetBlackjackSession, startBlackjackSession } from "./useBlackjack";
import { resetHigherOrLowerSession, startHigherOrLowerSession } from "./useHigherOrLower";
import { resetMemorySession, startMemorySession } from "./useMemory";
import { resetRatscrewSession, startRatscrewSession } from "./useRatscrew";
import { resetWarSession, startWarSession } from "./useWar";

/** Clears every minigame composable session (safe to call when not in a minigame). */
export function resetAllMinigameSessions(): void {
    resetBlackjackSession();
    resetHigherOrLowerSession();
    resetMemorySession();
    resetRatscrewSession();
    resetWarSession();
}

/** Starts the composable session for board-based minigames. */
export function startMinigameSession(player: Player, minigame: Minigame): void {
    if (minigame instanceof BlackjackMinigame) {
        startBlackjackSession(player, minigame);
    } else if (minigame instanceof HigherOrLowerMinigame) {
        startHigherOrLowerSession(player, minigame);
    } else if (minigame instanceof MemoryMinigame) {
        startMemorySession(player, minigame);
    } else if (minigame instanceof RatscrewMinigame) {
        startRatscrewSession(player, minigame);
    } else if (minigame instanceof WarMinigame) {
        startWarSession(player, minigame);
    }
}
