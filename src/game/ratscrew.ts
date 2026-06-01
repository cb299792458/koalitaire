import type Card from "../models/Card";
import { warCardValue } from "./war";

export type RatscrewPattern = "double" | "sandwich" | "double-sandwich";

/** Slappable pattern at the top of the pile after the latest flip (if any). */
export function detectRatscrewPattern(pile: readonly Card[]): RatscrewPattern | null {
    const n = pile.length;
    if (n < 2) return null;

    const top = warCardValue(pile[n - 1]!);

    if (warCardValue(pile[n - 2]!) === top) {
        return "double";
    }
    if (n >= 3 && warCardValue(pile[n - 3]!) === top) {
        return "sandwich";
    }
    if (n >= 4 && warCardValue(pile[n - 4]!) === top) {
        return "double-sandwich";
    }
    return null;
}

export function ratscrewPatternLabel(pattern: RatscrewPattern): string {
    switch (pattern) {
        case "double":
            return "Double";
        case "sandwich":
            return "Sandwich";
        case "double-sandwich":
            return "Double sandwich";
    }
}
