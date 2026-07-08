import { MONTY_CARD_ARTWORK_BY_NAME } from "../models/minigames/MontyHallMinigame";
import { SHELL_CARD_ARTWORK_BY_NAME } from "../models/minigames/ShellGameMinigame";

const MINIGAME_CARD_ARTWORK_BY_NAME: Record<string, string> = {
    ...SHELL_CARD_ARTWORK_BY_NAME,
    ...MONTY_CARD_ARTWORK_BY_NAME,
};

/**
 * Image URLs tried in order for artwork keyed by display name (spell names, cardifact names, etc.).
 * Matches the resolution order used by `SingleCard.vue` (spell artwork).
 */
export function cardArtworkFallbackUrls(artworkName: string): string[] {
    const name = String(artworkName);
    const override = MINIGAME_CARD_ARTWORK_BY_NAME[name];
    const basePath = `/cards/${name.replace(/\s+/g, '_')}`;
    const basePathWithSpaces = `/cards/${encodeURIComponent(name)}`;
    const base = [
        ...(override ? [override] : []),
        `${basePath}.png`,
        `${basePath}.jpg`,
        `${basePathWithSpaces}.png`,
        `${basePathWithSpaces}.jpg`,
    ];
    return [...new Set([...base, '/cards/default.png', '/cards/default.jpg', '/unknown.jpg'])];
}
