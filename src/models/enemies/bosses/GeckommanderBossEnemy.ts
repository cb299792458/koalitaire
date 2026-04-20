import Enemy, { type EnemyTurnContext } from "../../Enemy";
import EnemyAction from "../../EnemyAction";
import { Race } from "../../Summon";
import type { SummonTemplate } from "../../../game/summons";
import { createSummon } from "../../../game/summons";

const geckTemplate: SummonTemplate = {
    name: "Geck",
    description: "A tiny gecko in the Geckommander's hundred-strong horde.",
    tooltip: "3 HP, 1 attack. One down, ninety-nine to go.",
    hp: 3,
    damage: 1,
    race: Race.Salamander,
};

/** Ten Gecks per turn for ten turns → one hundred Gecks. */
const deployGecks = new EnemyAction(
    "Release the Gecks!",
    "Summons ten Gecks (3 HP, 1 attack each).",
    (enemy) => {
        for (let i = 0; i < 10; i++) {
            enemy.summons.push(createSummon(geckTemplate));
        }
    }
);

const nooneCanDefeat = new EnemyAction(
    "Noone can defeat my 100 Gecks!",
    "The Geckommander is fresh out of Gecks — but not out of swagger.",
    () => {}
);

function geckommanderTurnActions(context: EnemyTurnContext) {
    if (context.turnNumber <= 10) {
        return [deployGecks];
    }
    return [nooneCanDefeat];
}

export default class GeckommanderBossEnemy extends Enemy {
    constructor() {
        super({
            name: "Geckommander and the 100 Gecks",
            health: 46,
            tooltip: "Boss — ten waves of ten Gecks, then pure confidence.",
            generateTurnActions: geckommanderTurnActions,
        });
    }
}
