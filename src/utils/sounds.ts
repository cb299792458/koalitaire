/**
 * Play a sound from the public/sounds directory.
 * @param name - Filename without extension (e.g. 'mana' for mana.wav)
 * @param ext - File extension. Defaults to 'wav'.
 */
export function playSound(name: string, ext: string = 'wav'): void {
    const audio = new Audio(`/sounds/${name}.${ext}`);
    audio.play().catch(() => {
        // Ignore autoplay policy errors
    });
}

/**
 * Play a sound and return a Promise that resolves when playback finishes.
 * Use when you need to wait before proceeding (e.g. to avoid overlapping sounds).
 */
export function playSoundAndWait(name: string, ext: string = 'wav'): Promise<void> {
    return new Promise((resolve) => {
        const audio = new Audio(`/sounds/${name}.${ext}`);
        audio.addEventListener('ended', () => resolve());
        audio.addEventListener('error', () => resolve()); // Don't block on load/play errors
        audio.play().catch(() => resolve());
    });
}
