import Enemy, { enemyActionFromKey, type EnemyTurnContext } from "../../Enemy";
import EnemyAction from "../../EnemyAction";
import { Race } from "../../Summon";
import type { SummonTemplate } from "../../../game/summons";
import { createSummon } from "../../../game/summons";

const TWIN_NAME = "Clone";

const twinBase: Omit<SummonTemplate, "name"> = {
    description: "They're identical, and can never agree on who's the original and who's the clone.",
    tooltip: "A fragile clone — same punch as a light jab each turn.",
    hp: 6,
    damage: 3,
    race: Race.Quokka,
    effect: async (combat, summon) => {
        await combat.damagePlayer(summon.damage);
    },
};

function spawnTwin(enemy: Enemy): void {
    enemy.summons.push(
        createSummon({
            ...twinBase,
            name: TWIN_NAME,
            hp: enemy.scaleHealth(twinBase.hp),
            damage: enemy.scaleDamage(twinBase.damage),
        })
    );
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
    constructor(act: number) {
        super({
            act,
            name: "Brawler Twins",
            health: 18,
            attack: 0,
            tooltip: "Fight in twos — drop the twin and another tags in.",
            generateTurnActions: brawlerTwinsTurn,
            onCombatStart: (enemy) => {
                spawnTwin(enemy);
            },
        });
    }
}
