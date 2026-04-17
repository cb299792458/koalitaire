import type Card from "./Card";

const DEFAULT_HAND_SLOT_COUNT = 1;

/**
 * Hand slots; each holds 0 or 1 card.
 * Not shuffled into deck on End Turn.
 */
class Hand {
    private _slots: (Card | undefined)[];

    constructor(slotCount: number = DEFAULT_HAND_SLOT_COUNT) {
        this._slots = Array.from({ length: slotCount });
    }

    get slots(): (Card | undefined)[] {
        return this._slots;
    }

    getSlotCount(): number {
        return this._slots.length;
    }

    getSlot(index: number): Card | undefined {
        return this._slots[index];
    }

    setSlot(index: number, card: Card | undefined): void {
        if (index >= 0 && index < this._slots.length) {
            this._slots[index] = card;
        }
    }

    /** Index of the slot containing this card, or -1. */
    getSlotIndex(card: Card): number {
        const i = this._slots.indexOf(card);
        return i >= 0 ? i : -1;
    }

    /** All cards in the hand (for iteration, e.g. movable to mana). */
    get cards(): Card[] {
        return this._slots.filter((c): c is Card => c != null);
    }

    /** Add card to the first empty slot. Used e.g. by draw or effects. */
    addCard(card: Card): void {
        const i = this._slots.findIndex((c) => c == null);
        if (i !== -1) this._slots[i] = card;
    }

    clear(): void {
        this._slots = Array.from({ length: this._slots.length });
    }
}

export default Hand;
export { DEFAULT_HAND_SLOT_COUNT as HAND_SLOT_COUNT };
