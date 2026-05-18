import Enemy, { buildDeckFromPattern, createSequentialActionGenerator } from "../../Enemy";

export default class TacticianEnemy extends Enemy {
    constructor(act: number) {
        super({
            act,
            name: "Tactician",
            health: 18,
            generateTurnActions: createSequentialActionGenerator(() =>
                buildDeckFromPattern(["weakAttack"])
            ),
        });
    }
}
