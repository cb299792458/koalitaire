import Cardifact, { type CardifactContext } from "../../models/Cardifact";

const BLOCK_TURN_1 = 5;
const BLOCK_TURN_2 = 10;
const BLOCK_TURN_3 = 15;

function grantBlockOnNthPlayerTurn(ctx: CardifactContext, n: number, amount: number): void {
    let turn = 0;
    const unsub = ctx.events.subscribe((event) => {
        if (event.type !== "playerTurnStarted") return;
        turn += 1;
        if (turn === n) {
            ctx.player.gainBlock(amount);
            unsub();
        }
    });
}

/** +Block on the first player turn of each combat only. */
export class FirstTurnBlockCardifact extends Cardifact {
    constructor() {
        super({
            id: "first_turn_block",
            name: "Opening Ward",
            description: `Gain ${BLOCK_TURN_1} Block on the first turn of each combat.`,
        });
    }

    onCombatStart(ctx: CardifactContext): void {
        grantBlockOnNthPlayerTurn(ctx, 1, BLOCK_TURN_1);
    }
}

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
        grantBlockOnNthPlayerTurn(ctx, 2, BLOCK_TURN_2);
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
        grantBlockOnNthPlayerTurn(ctx, 3, BLOCK_TURN_3);
    }
}
