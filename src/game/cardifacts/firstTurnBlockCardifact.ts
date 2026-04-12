import Cardifact, { type CardifactContext } from "../../models/Cardifact";

const BLOCK = 5;

/** +Block on the first player turn of each combat only. */
export class FirstTurnBlockCardifact extends Cardifact {
    constructor() {
        super({
            id: "first_turn_block",
            name: "Opening Ward",
            description: `Gain ${BLOCK} Block on the first turn of each combat.`,
        });
    }

    onCombatStart(ctx: CardifactContext): void {
        const unsub = ctx.events.subscribe((event) => {
            if (event.type !== "playerTurnStarted") return;
            ctx.player.block += BLOCK;
            unsub();
        });
    }
}
