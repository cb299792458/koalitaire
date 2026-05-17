import Enemy from "../../Enemy";
import { buildAttackAction } from "../../EnemyAction";

const throneCrackdown = buildAttackAction({
    name: "Throne Crackdown",
    damage: 18,
    description: "Kolan Graydad strikes for 18 damage, plus attack.",
});

export default class KolanGraydadBossEnemy extends Enemy {
    constructor() {
        super({
            name: "Kolan Graydad",
            health: 80,
            tooltip: "Your father, the Koala King — final boss of the run.",
            generateTurnActions: () => [throneCrackdown],
        });
    }
}
