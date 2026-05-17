/** Design reference: The Maltese Falcon (novel and film). */
import Enemy from "../../Enemy";
import { buildAttackAction } from "../../EnemyAction";

const placeholderStrike = buildAttackAction({
    name: "Placeholder Strike",
    damage: 8,
    description: "Placeholder guardian attack for 8 damage, plus attack.",
});

export default class SpadeTheFalconGuardianEnemy extends Enemy {
    constructor() {
        super({
            name: "Spade, the Falcon",
            health: 40,
            tooltip: "Guardian of the final act.",
            generateTurnActions: () => [placeholderStrike],
        });
    }
}
