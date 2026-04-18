import Cardifact from "../../models/Cardifact";
import type Player from "../../models/Player";
import { PostCombatGoldCardifact } from "./postCombatGoldCardifact";
import {
    FirstTurnBlockCardifact,
    SecondTurnBlockCardifact,
    ThirdTurnBlockCardifact,
} from "./turnBlockCardifacts";
import { BlockGainDamageCardifact } from "./blockGainDamageCardifact";
import { CombatStartRatCardifact } from "./combatStartRatCardifact";

const BUFF = 2;

/** Permanent +Armor when acquired; reversed on remove. */
export class ArmorCardifact extends Cardifact {
    constructor() {
        super({
            id: "stat_armor",
            name: "Barkplate Charm",
            description: `+${BUFF} Armor.`,
        });
    }

    onAcquire(player: Player): void {
        player.armor += BUFF;
    }

    onRemove(player: Player): void {
        player.armor -= BUFF;
    }
}

/** Permanent +Appeal when acquired; reversed on remove. */
export class AppealCardifact extends Cardifact {
    constructor() {
        super({
            id: "stat_appeal",
            name: "Courtiers' Favor",
            description: `+${BUFF} Appeal.`,
        });
    }

    onAcquire(player: Player): void {
        player.appeal += BUFF;
    }

    onRemove(player: Player): void {
        player.appeal -= BUFF;
    }
}

/** Permanent +Agility when acquired; reversed on remove. */
export class AgilityCardifact extends Cardifact {
    constructor() {
        super({
            id: "stat_agility",
            name: "Windthread",
            description: `+${BUFF} Agility.`,
        });
    }

    onAcquire(player: Player): void {
        player.agility += BUFF;
    }

    onRemove(player: Player): void {
        player.agility -= BUFF;
    }
}

/** Permanent +Acumen when acquired; reversed on remove. */
export class AcumenCardifact extends Cardifact {
    constructor() {
        super({
            id: "stat_acumen",
            name: "Ledger Lens",
            description: `+${BUFF} Acumen.`,
        });
    }

    onAcquire(player: Player): void {
        player.acumen += BUFF;
    }

    onRemove(player: Player): void {
        player.acumen -= BUFF;
    }
}

/** Every cardifact available at run start for the free pick (one choice). */
export const ALL_STARTING_CARDIFACT_CLASSES = [
    ArmorCardifact,
    AppealCardifact,
    AgilityCardifact,
    AcumenCardifact,
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
