import type Card from "../models/Card";

/** Duration of {@link Card.animateDraw} / shared minigame deal transitions. */
export const MINIGAME_CARD_ANIM_MS = 500;

/** Reveal a card and play the standard flip-in animation on its {@link SingleCard} view. */
export function revealWithDealAnimation(card: Card): void {
    card.revealed = true;
    card.animateDraw();
}

/** Flip-in animation without changing revealed state (already face-up). */
export function playDealAnimation(card: Card): void {
    card.animateDraw();
}
