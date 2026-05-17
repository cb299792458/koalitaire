/** Design reference: Marina (Marina and the Diamonds). */
import Enemy from "../../Enemy";
import { buildAttackAction } from "../../EnemyAction";

const placeholderStrike = buildAttackAction({
    name: "Placeholder Strike",
    damage: 8,
    description: "Placeholder guardian attack for 8 damage, plus attack.",
});

export default class DiamondTheStingrayGuardianEnemy extends Enemy {
    constructor() {
        super({
            name: "Diamond, the Stingray",
            health: 40,
            tooltip: "Guardian of the final act.",
            generateTurnActions: () => [placeholderStrike],
        });
    }
}
