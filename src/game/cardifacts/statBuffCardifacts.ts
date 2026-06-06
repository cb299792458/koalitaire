import { PostCombatGoldCardifact } from "./postCombatGoldCardifact";
import {
    FirstTurnBlockCardifact,
    SecondTurnBlockCardifact,
    ThirdTurnBlockCardifact,
} from "./turnBlockCardifacts";
import { BlockGainDamageCardifact } from "./blockGainDamageCardifact";
import { CombatStartRatCardifact } from "./combatStartRatCardifact";

/** Every cardifact available at run start for the free pick (one choice). */
export const ALL_STARTING_CARDIFACT_CLASSES = [
    FirstTurnBlockCardifact,
    SecondTurnBlockCardifact,
    ThirdTurnBlockCardifact,
    BlockGainDamageCardifact,
    CombatStartRatCardifact,
    PostCombatGoldCardifact,
] as const;

export type StartingCardifactClass = (typeof ALL_STARTING_CARDIFACT_CLASSES)[number];

/** Pick up to `count` random starting cardifact classes the player does not already own (by id). */
export function pickRandomUnownedStartingCardifactClasses(
    ownedIds: ReadonlySet<string>,
    count: number
): StartingCardifactClass[] {
    const unowned = ALL_STARTING_CARDIFACT_CLASSES.filter((Cls) => !ownedIds.has(new Cls().id));
    const shuffled = [...unowned].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}
