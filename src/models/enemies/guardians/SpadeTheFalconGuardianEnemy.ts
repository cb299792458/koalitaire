/** Design reference: The Maltese Falcon (novel and film). */
import Enemy, { type EnemyTurnContext } from "../../Enemy";
import EnemyAction, { buildAttackAction } from "../../EnemyAction";
import { CombatStatusId } from "../../../game/combatStatuses";
import { DamageType } from "../../DamageType";
import { Race } from "../../Summon";
import type { SummonTemplate } from "../../../game/summons";
import { createSummon } from "../../../game/summons";

const MILES_ARCHER_NAME = "Miles Archer";
const TALON_STRIKE_DAMAGE = 8;
const PARTNER_REVENGE_STAT_BONUS = 6;
const STATUS_TURNS = 2;

const talonStrike = buildAttackAction({
    name: "Talon Strike",
    damage: TALON_STRIKE_DAMAGE,
    description: `Spade, the Falcon rakes you with talons for ${TALON_STRIKE_DAMAGE} damage, plus attack.`,
});

const investigate = new EnemyAction(
    "Investigate",
    "Spade, the Falcon investigates — you are Knackered and Crooked for two turns each.",
    (_enemy, player, combat) => {
        player.addCombatStatus(CombatStatusId.Knackered, STATUS_TURNS);
        player.addCombatStatus(CombatStatusId.Crook, STATUS_TURNS);
        combat.notify();
    }
);

const takeFlight = new EnemyAction(
    "Take Flight",
    "Spade, the Falcon takes flight — gains 1 dodge.",
    (enemy, _player, combat) => {
        enemy.dodge += 1;
        combat.notify();
    }
);

const whenMansPartnerIsKilled = new EnemyAction(
    "When a man's partner is killed, he's supposed to do something about it.",
    "Miles Archer is gone — Spade hardens his resolve once, gaining attack and armor.",
    (enemy, _player, combat) => {
        const bonus = enemy.scaleStat(PARTNER_REVENGE_STAT_BONUS);
        enemy.attack += bonus;
        enemy.armor += bonus;
        combat.notify();
    }
);

const milesArcherTemplate: SummonTemplate = {
    name: MILES_ARCHER_NAME,
    description: "Miles Archer backs Spade from the shadows with ranged shots.",
    tooltip: "Fires ranged damage each enemy turn while he lives.",
    hp: 7,
    damage: 3,
    race: Race.Dingo,
    effect: async (combat, summon) => {
        await combat.damagePlayer(summon.damage, [DamageType.Ranged]);
    },
};

const CYCLE: EnemyAction[] = [investigate, takeFlight, talonStrike];

interface SpadeTurnState {
    cycleIndex: number;
    partnerRevengeUsed: boolean;
}

const spadeTurnState = new WeakMap<Enemy, SpadeTurnState>();

function getSpadeTurnState(enemy: Enemy): SpadeTurnState {
    let state = spadeTurnState.get(enemy);
    if (!state) {
        state = { cycleIndex: 0, partnerRevengeUsed: false };
        spadeTurnState.set(enemy, state);
    }
    return state;
}

function isMilesArcherAlive(enemy: Enemy): boolean {
    return enemy.summons.some((s) => s.name === MILES_ARCHER_NAME && s.hp > 0);
}

function spadeTurnActions(context: EnemyTurnContext): EnemyAction[] {
    const { enemy, actions } = context;
    const state = getSpadeTurnState(enemy);
    const out: EnemyAction[] = [];

    for (let i = 0; i < actions; i++) {
        if (!state.partnerRevengeUsed && !isMilesArcherAlive(enemy)) {
            state.partnerRevengeUsed = true;
            out.push(whenMansPartnerIsKilled);
            continue;
        }
        out.push(CYCLE[state.cycleIndex % CYCLE.length]!);
        state.cycleIndex += 1;
    }

    return out;
}

export default class SpadeTheFalconGuardianEnemy extends Enemy {
    constructor(act: number) {
        super({
            act,
            name: "Spade, the Falcon",
            health: 40,
            tooltip:
                "Guardian — opens with Miles Archer (ranged). Cycles Investigate, Take Flight, and Talon Strike; if Miles dies, uses his partner's vengeance once for a lasting buff.",
            generateTurnActions: spadeTurnActions,
            onCombatStart: (enemy) => {
                const scaled = {
                    ...milesArcherTemplate,
                    hp: enemy.scaleHealth(milesArcherTemplate.hp),
                    damage: enemy.scaleDamage(milesArcherTemplate.damage),
                };
                enemy.summons.push(createSummon(scaled));
            },
        });
    }
}
