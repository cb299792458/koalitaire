import Cardifact, { type CardifactContext } from "../../models/Cardifact";

const PROC_DAMAGE = 1;

/** Deal damage to the enemy whenever the player gains Block (once per gainBlock call). */
export class BlockGainDamageCardifact extends Cardifact {
    constructor() {
        super({
            id: "block_gain_damage",
            name: "Splintered Guard",
            description: `Whenever you gain Block, deal ${PROC_DAMAGE} damage to the enemy.`,
        });
    }

    onCombatStart(ctx: CardifactContext): void {
        ctx.events.subscribe((event) => {
            if (event.type !== "playerGainedBlock" || event.amount <= 0) return;
            void ctx.damageEnemy(PROC_DAMAGE);
        });
    }
}
