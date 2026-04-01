import Enemy from "../Enemy";
import { buildAttackAction } from "../EnemyAction";

export default class BarrageEnemy extends Enemy {
    constructor() {
        super({
            name: "Barrage",
            health: 20,
            generateTurnActions: () => {
                const actions = [];
                for (let i = 0; i < 5; i++) {
                    actions.push(buildAttackAction({ name: "Barrage Hit", damage: 2 }));
                }
                return actions;
            },
        });
    }
}
