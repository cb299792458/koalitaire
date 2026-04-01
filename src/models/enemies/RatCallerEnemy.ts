import Enemy, { buildDeckFromPattern, createSequentialActionGenerator } from "../Enemy";

export default class RatCallerEnemy extends Enemy {
    constructor() {
        super({
            name: "Rat Caller",
            health: 18,
            generateTurnActions: createSequentialActionGenerator(() =>
                buildDeckFromPattern(["summonRat"])
            ),
        });
    }
}
