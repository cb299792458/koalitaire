/** Design reference: Seal, the singer. */
import Enemy from "../../Enemy";
import { buildAttackAction } from "../../EnemyAction";

const placeholderStrike = buildAttackAction({
    name: "Placeholder Strike",
    damage: 8,
    description: "Placeholder guardian attack for 8 damage, plus attack.",
});

export default class ClubTheSealGuardianEnemy extends Enemy {
    constructor() {
        super({
            name: "Club, the Seal",
            health: 40,
            tooltip: "Guardian of the final act.",
            generateTurnActions: () => [placeholderStrike],
        });
    }
}
