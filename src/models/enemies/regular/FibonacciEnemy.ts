import Enemy from "../../Enemy";
import { buildAttackAction } from "../../EnemyAction";

/** Cap strike damage near a weak attack so the sequence does not outscale other regulars. */
const FIB_DAMAGE_CAP = 5;

export default class FibonacciEnemy extends Enemy {
    constructor(act: number) {
        let previous = 1;
        let current = 1;

        super({
            act,
            name: "Fibonacci",
            health: 18,
            generateTurnActions: () => {
                const damage = Math.min(previous, FIB_DAMAGE_CAP);
                const next = previous + current;
                previous = current;
                current = next;

                return [
                    buildAttackAction({
                        name: "Fibonacci Strike",
                        damage,
                    }),
                ];
            },
        });
    }
}
