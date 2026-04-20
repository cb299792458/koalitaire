import Enemy, { type EnemyTurnContext } from "../../Enemy";
import EnemyAction, { buildAttackAction } from "../../EnemyAction";
import { Race } from "../../Summon";
import type { SummonTemplate } from "../../../game/summons";
import { createSummon } from "../../../game/summons";

const saltyTemplate: SummonTemplate = {
    name: "Salty, the Saltwater Crocodile",
    description: "Summoning Salty, the Saltwater Crocodile.",
    tooltip: "A heavy-hitting partner from the mangroves — salt in the wound, teeth in the tale.",
    hp: 18,
    damage: 6,
    race: Race.Salamander,
};

const punchOut = buildAttackAction({
    name: "Punch Out",
    damage: 14,
    description: "A haymaker from the Crocodile Hunter — 14 damage, plus their attack.",
});

const summonSalty = new EnemyAction(
    "Summoning Salty",
    "The Hunter whistles up from the mud — Salty, the Saltwater Crocodile, answers the call.",
    (enemy, _player, combat) => {
        enemy.summons.push(createSummon(saltyTemplate));
        combat.notify();
    }
);

function crocodileHunterTurn(context: EnemyTurnContext) {
    if (context.turnNumber === 1) {
        return [summonSalty];
    }
    return [punchOut];
}

export default class CrocodileHunterBossEnemy extends Enemy {
    constructor() {
        super({
            name: "Crocodile Hunter",
            health: 48,
            tooltip: "Boss — calls Salty on the first turn, then throws Punch Outs.",
            generateTurnActions: crocodileHunterTurn,
        });
    }
}
