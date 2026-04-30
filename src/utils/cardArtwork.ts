/**
 * Image URLs tried in order for artwork keyed by display name (spell names, cardifact names, etc.).
 * Matches the resolution order used by `SingleCard.vue` (spell artwork).
 */
export function cardArtworkFallbackUrls(artworkName: string): string[] {
    const name = String(artworkName);
    const basePath = `/cards/${name.replace(/\s+/g, '_')}`;
    const basePathWithSpaces = `/cards/${encodeURIComponent(name)}`;
    const base = [
        `${basePath}.png`,
        `${basePath}.jpg`,
        `${basePathWithSpaces}.png`,
        `${basePathWithSpaces}.jpg`,
    ];
    return [...new Set([...base, '/cards/default.png', '/cards/default.jpg', '/unknown.jpg'])];
}
