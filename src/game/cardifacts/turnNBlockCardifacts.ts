import Cardifact, { type CardifactContext } from "../../models/Cardifact";

const BLOCK_TURN_2 = 10;
const BLOCK_TURN_3 = 15;

/** +Block at the start of the player's second turn each combat. */
export class SecondTurnBlockCardifact extends Cardifact {
    constructor() {
        super({
            id: "block_turn_2",
            name: "Bracing Step",
            description: `Gain ${BLOCK_TURN_2} Block at the start of your second turn each combat.`,
        });
    }

    onCombatStart(ctx: CardifactContext): void {
        let turn = 0;
        const unsub = ctx.events.subscribe((event) => {
            if (event.type !== "playerTurnStarted") return;
            turn += 1;
            if (turn === 2) {
                ctx.player.block += BLOCK_TURN_2;
                unsub();
            }
        });
    }
}

/** +Block at the start of the player's third turn each combat. */
export class ThirdTurnBlockCardifact extends Cardifact {
    constructor() {
        super({
            id: "block_turn_3",
            name: "Late Bulwark",
            description: `Gain ${BLOCK_TURN_3} Block at the start of your third turn each combat.`,
        });
    }

    onCombatStart(ctx: CardifactContext): void {
        let turn = 0;
        const unsub = ctx.events.subscribe((event) => {
            if (event.type !== "playerTurnStarted") return;
            turn += 1;
            if (turn === 3) {
                ctx.player.block += BLOCK_TURN_3;
                unsub();
            }
        });
    }
}
