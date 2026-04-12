import Cardifact, { type CardifactContext } from "../../models/Cardifact";

const GOLD = 10;

/** Bonus koallarbucks after each victorious combat. */
export class PostCombatGoldCardifact extends Cardifact {
    constructor() {
        super({
            id: "post_combat_gold",
            name: "Tollkeeper's Cut",
            description: `Gain ${GOLD} gold after each combat.`,
        });
    }

    onCombatStart(ctx: CardifactContext): void {
        ctx.events.subscribe((event) => {
            if (event.type !== "enemyDefeated") return;
            const runPlayer = ctx.player.originalPlayer ?? ctx.player;
            runPlayer.koallarbucks += GOLD;
        });
    }
}
