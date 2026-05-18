import { reactive } from 'vue';

/** Set while mana-pool cards bounce (full compost cycle at end turn). */
export const compostCelebrationState = reactive({
    active: false,
});

let resolveCelebration: (() => void) | null = null;

/** Await until the solitaire-style bounce finishes (or immediately if nothing to animate). */
export function playManaPoolCelebration(): Promise<void> {
    if (compostCelebrationState.active) {
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        resolveCelebration = resolve;
        compostCelebrationState.active = true;
    });
}

export function finishManaPoolCelebration(): void {
    compostCelebrationState.active = false;
    const done = resolveCelebration;
    resolveCelebration = null;
    done?.();
}
