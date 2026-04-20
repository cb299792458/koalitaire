import Enemy, { enemyActionFromKey, type EnemyTurnContext } from "../Enemy";
import EnemyAction from "../EnemyAction";
import { Race } from "../Summon";
import type { SummonTemplate } from "../../game/summons";
import { createSummon } from "../../game/summons";

const TWIN_NAME = "Clone";

/** Same total as the shared `weakAttack` action (5 + attack). */
function brawlerStrikeDamage(enemy: Enemy): number {
    return 5 + enemy.attack;
}

function twinTemplateFor(enemy: Enemy): SummonTemplate {
    return {
        name: TWIN_NAME,
        description: "They're identical, and can never agree on who's the original and who's the clone.",
        tooltip: "Hits each turn for the same base + attack as the Brawler's weak punch.",
        hp: enemy.health,
        damage: brawlerStrikeDamage(enemy),
        race: Race.Quokka,
    };
}

function spawnTwin(enemy: Enemy): void {
    enemy.summons.push(createSummon(twinTemplateFor(enemy)));
}

const callTwin = new EnemyAction(
    "Call in the twin",
    "Creates a clone of himself to aid in the fight.",
    (enemy, _player, combat) => {
        spawnTwin(enemy);
        combat.notify();
    }
);

function brawlerTwinsTurn(context: EnemyTurnContext): EnemyAction[] {
    const twinAlive = context.enemy.summons.some((s) => s.name === TWIN_NAME && s.hp > 0);
    if (twinAlive) {
        return [enemyActionFromKey("weakAttack")];
    }
    return [callTwin];
}

export default class BrawlerTwinsEnemy extends Enemy {
    constructor() {
        super({
            name: "Brawler Twins",
            health: 32,
            attack: 0,
            tooltip: "Fight in twos — drop the twin and another tags in.",
            generateTurnActions: brawlerTwinsTurn,
            onCombatStart: (enemy) => {
                spawnTwin(enemy);
            },
        });
    }
}
