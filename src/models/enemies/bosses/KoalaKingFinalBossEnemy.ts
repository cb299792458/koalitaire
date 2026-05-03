import Enemy from "../../Enemy";
import { buildAttackAction } from "../../EnemyAction";

const throneCrackdown = buildAttackAction({
    name: "Throne Crackdown",
    damage: 18,
    description: "The final tyrant strikes for 18 damage, plus attack.",
});

export default class KoalaKingFinalBossEnemy extends Enemy {
    constructor() {
        super({
            name: "King Koala Placeholder",
            health: 80,
            tooltip: "Placeholder final boss for the full-run showdown.",
            generateTurnActions: () => [throneCrackdown],
        });
    }
}
