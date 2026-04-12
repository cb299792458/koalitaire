import Cardifact from "../../models/Cardifact";
import type Player from "../../models/Player";
import { FirstTurnBlockCardifact } from "./firstTurnBlockCardifact";
import { PostCombatGoldCardifact } from "./postCombatGoldCardifact";
import { SecondTurnBlockCardifact, ThirdTurnBlockCardifact } from "./turnNBlockCardifacts";
import { BlockGainDamageCardifact } from "./blockGainDamageCardifact";

const BUFF = 2;

/** Permanent +Attack when acquired; reversed on remove. */
export class AttackCardifact extends Cardifact {
    constructor() {
        super({
            id: "stat_attack",
            name: "Ember Knot",
            description: `+${BUFF} Attack.`,
        });
    }

    onAcquire(player: Player): void {
        player.attack += BUFF;
    }

    onRemove(player: Player): void {
        player.attack -= BUFF;
    }
}

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
    AttackCardifact,
    ArmorCardifact,
    AppealCardifact,
    AgilityCardifact,
    AcumenCardifact,
    FirstTurnBlockCardifact,
    SecondTurnBlockCardifact,
    ThirdTurnBlockCardifact,
    BlockGainDamageCardifact,
    PostCombatGoldCardifact,
] as const;

export type StartingCardifactClass = (typeof ALL_STARTING_CARDIFACT_CLASSES)[number];
