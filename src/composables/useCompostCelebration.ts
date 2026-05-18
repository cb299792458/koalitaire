import { reactive } from 'vue';

export type CompostCelebrationPhase = 'mana-bounce' | 'compost-snake' | 'both';

/** Set during the full compost-cycle celebration at end turn. */
export const compostCelebrationState = reactive({
    active: false,
    phase: null as CompostCelebrationPhase | null,
});

let resolveCelebration: (() => void) | null = null;

/** Await until mana bounce and compost swirl animations finish. */
export function playManaPoolCelebration(): Promise<void> {
    if (compostCelebrationState.active) {
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        resolveCelebration = resolve;
        compostCelebrationState.active = true;
        compostCelebrationState.phase = 'mana-bounce';
    });
}

export function finishManaPoolCelebration(): void {
    compostCelebrationState.active = false;
    compostCelebrationState.phase = null;
    const done = resolveCelebration;
    resolveCelebration = null;
    done?.();
}
