import Enemy, { enemyActionFromKey, type EnemyTurnContext } from "../../Enemy";
import EnemyAction from "../../EnemyAction";
import { Race } from "../../Summon";
import type { SummonTemplate } from "../../../game/summons";
import { createSummon } from "../../../game/summons";

const TWIN_NAME = "Clone";

/** Same total damage as one {@link enemyActionFromKey} `weakAttack` for this enemy. */
function brawlerStrikeDamage(enemy: Enemy): number {
    return enemy.scaleDamage(5) + enemy.attack;
}

/** Clone opens with the same HP and punch as the brawler at spawn time (after act scaling). */
function twinStatsFromBrawler(enemy: Enemy): Pick<SummonTemplate, "hp" | "damage"> {
    return {
        hp: enemy.health,
        damage: brawlerStrikeDamage(enemy),
    };
}

function twinTemplateFor(enemy: Enemy): SummonTemplate {
    const { hp, damage } = twinStatsFromBrawler(enemy);
    return {
        name: TWIN_NAME,
        description: "They're identical, and can never agree on who's the original and who's the clone.",
        tooltip: "A perfect copy — same health and strike as the Brawler at the moment it appears.",
        hp,
        damage,
        race: Race.Quokka,
        effect: async (combat, summon) => {
            await combat.damagePlayer(summon.damage);
        },
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
    constructor(act: number) {
        super({
            act,
            name: "Brawler Twins",
            health: 40,
            attack: 2,
            tooltip: "Elite — fight in twos; the clone mirrors the Brawler's health and strike.",
            generateTurnActions: brawlerTwinsTurn,
            onCombatStart: (enemy) => {
                spawnTwin(enemy);
            },
        });
    }
}
