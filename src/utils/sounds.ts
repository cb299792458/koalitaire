const SOUNDS_DIR = '/sounds';

function soundUrl(name: string, ext: string): string {
    return `${SOUNDS_DIR}/${name}.${ext}`;
}

function createAudio(name: string, ext: string = 'wav'): HTMLAudioElement {
    return new Audio(soundUrl(name, ext));
}

/**
 * Play a sound from the public/sounds directory.
 * @param name - Filename without extension (e.g. 'mana' for mana.wav)
 * @param ext - File extension. Defaults to 'wav'.
 */
export function playSound(name: string, ext: string = 'wav'): void {
    createAudio(name, ext).play().catch(() => {});
}

/**
 * Play a sound and return a Promise that resolves when playback finishes.
 * Use when you need to wait before proceeding (e.g. to avoid overlapping sounds).
 */
export function playSoundAndWait(name: string, ext: string = 'wav'): Promise<void> {
    const audio = createAudio(name, ext);
    return new Promise((resolve) => {
        audio.addEventListener('ended', () => resolve());
        audio.addEventListener('error', () => resolve());
        audio.play().catch(() => resolve());
    });
}

/**
 * Play the button click sound.
 */
export function playButtonClick(): void {
    playSound('select');
}
