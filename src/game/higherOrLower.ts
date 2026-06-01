import type Card from "../models/Card";
import { warCardValue } from "./war";

export type HigherOrLowerGuess = "higher" | "lower";

export function higherOrLowerIsTie(current: Card, next: Card): boolean {
    return warCardValue(current) === warCardValue(next);
}

/** True if the guess is correct; equal ranks count as a win. */
export function higherOrLowerGuessWins(
    guess: HigherOrLowerGuess,
    current: Card,
    next: Card
): boolean {
    const currentValue = warCardValue(current);
    const nextValue = warCardValue(next);
    if (currentValue === nextValue) return true;
    if (guess === "higher") return nextValue > currentValue;
    return nextValue < currentValue;
}
