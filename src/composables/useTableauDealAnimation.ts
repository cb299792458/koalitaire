import { reactive } from 'vue';

export type ApplyTableauDealFn = () => void | Promise<void>;

/** Set while cards fly from the deck to the tableau after a deal. */
export const tableauDealState = reactive({
    active: false,
    applyDeal: null as ApplyTableauDealFn | null,
});

let resolveDeal: (() => void) | null = null;

/**
 * Await until the deal fly-in animation finishes.
 * `applyDeal` runs after deck positions are captured but before the fly animation.
 */
export function playTableauDealAnimation(applyDeal: ApplyTableauDealFn): Promise<void> {
    if (tableauDealState.active) {
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        resolveDeal = resolve;
        tableauDealState.applyDeal = applyDeal;
        tableauDealState.active = true;
    });
}

export function finishTableauDealAnimation(): void {
    tableauDealState.active = false;
    tableauDealState.applyDeal = null;
    const done = resolveDeal;
    resolveDeal = null;
    done?.();
}
