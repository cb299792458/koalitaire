import Enemy from "../Enemy";
import EnemyAction from "../EnemyAction";

export default class FibonacciEnemy extends Enemy {
    constructor() {
        let previous = 1;
        let current = 1;

        super({
            name: "Fibonacci",
            health: 21,
            generateTurnActions: (actions) => {
                const turnActions: EnemyAction[] = [];

                for (let i = 0; i < actions; i++) {
                    const damage = previous;
                    const next = previous + current;
                    previous = current;
                    current = next;

                    turnActions.push(
                        new EnemyAction(
                            "Fibonacci Strike",
                            `The enemy attacks you for ${damage} damage, plus its attack.`,
                            (enemy, player) => {
                                player.takeDamage(damage + enemy.attack);
                            }
                        )
                    );
                }

                return turnActions;
            },
        });
    }
}
