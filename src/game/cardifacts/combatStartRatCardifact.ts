import Cardifact, { type CardifactContext } from "../../models/Cardifact";
import { createSummon, summons } from "../summons";

/** Summons a 1/1 Rat at the beginning of each combat. */
export class CombatStartRatCardifact extends Cardifact {
    constructor() {
        super({
            id: "combat_start_rat",
            name: "Cheese Crumbs",
            description: "At the start of each combat, summon a 1/1 Rat.",
        });
    }

    onCombatStart(ctx: CardifactContext): void {
        const template = summons.rat;
        if (template) {
            ctx.player.summons.push(createSummon(template));
        }
    }
}
