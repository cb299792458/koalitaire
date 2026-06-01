import { useMinigame } from "./useMinigame";

export function publishMinigameResult(message: string): void {
    useMinigame().resultMessage.value = message;
}
