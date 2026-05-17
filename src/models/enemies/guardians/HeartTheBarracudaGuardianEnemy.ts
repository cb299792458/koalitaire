/** Design reference: Heart (the rock band). */
import Enemy from "../../Enemy";
import { buildAttackAction } from "../../EnemyAction";

const placeholderStrike = buildAttackAction({
    name: "Placeholder Strike",
    damage: 8,
    description: "Placeholder guardian attack for 8 damage, plus attack.",
});

export default class HeartTheBarracudaGuardianEnemy extends Enemy {
    constructor() {
        super({
            name: "Heart, the Barracuda",
            health: 40,
            tooltip: "Guardian of the final act.",
            generateTurnActions: () => [placeholderStrike],
        });
    }
}
