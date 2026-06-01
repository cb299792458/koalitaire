import type { CSSProperties } from "vue";

/** Matches {@link CardStack} `layout="pile"` stacking in combat. */
export const COMBAT_PILE_STACK_STEP_PX = 0.25;

export function combatPileCardStyle(index: number, cardCount: number): CSSProperties {
    const offset = index * COMBAT_PILE_STACK_STEP_PX;
    return {
        position: "absolute",
        top: `-${offset}px`,
        left: `-${offset}px`,
        zIndex: cardCount + index,
    };
}

/** z-index for the top card in a pile (combat pile layout). */
export function combatPileTopZIndex(cardCount: number): number {
    if (cardCount <= 0) return 0;
    return cardCount + (cardCount - 1);
}

/** Above every card in the pile while a new card is flipping / flying in. */
export function combatPileInFlightZIndex(cardCount: number): number {
    return combatPileTopZIndex(cardCount) + 10;
}
