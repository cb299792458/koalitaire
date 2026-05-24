/** Design reference: Seal, the singer. */
import Enemy, { createSequentialActionGenerator } from "../../Enemy";
import EnemyAction, { buildAttackAction } from "../../EnemyAction";
import { CombatStatusId } from "../../../game/combatStatuses";
import { Race } from "../../Summon";
import type { SummonTemplate } from "../../../game/summons";
import { createSummon } from "../../../game/summons";

const CLUB_STRIKE_DAMAGE = 8;
const CLUB_SANDWICH_HEAL = 10;
const BULLETPROOF_BLOCK = 10;
const KISS_POISON_TURNS = 3;

const clubStrike = buildAttackAction({
    name: "Club Strike",
    damage: CLUB_STRIKE_DAMAGE,
    description: `Club, the Seal strikes for ${CLUB_STRIKE_DAMAGE} damage, plus attack.`,
});

const clubSandwich = new EnemyAction(
    "Club Sandwich",
    `Club, the Seal eats a club sandwich — heals for ${CLUB_SANDWICH_HEAL} health (scaled by act).`,
    (enemy, _player, combat) => {
        enemy.gainHealth(enemy.scaleHealth(CLUB_SANDWICH_HEAL));
        combat.notify();
    }
);

const kissFromARose = new EnemyAction(
    "Kiss from a Rose",
    "Kiss from a Rose — you are Poisoned. Your fate is sealed.",
    (_enemy, player, combat) => {
        player.addCombatStatus(CombatStatusId.Poisoned, KISS_POISON_TURNS);
        combat.notify();
    }
);

const shawtyTemplate: SummonTemplate = {
    name: "Shawty",
    description: "Another seal on stage with Club — bites for damage each turn.",
    tooltip: "Go Shawty — it's your birthday.",
    hp: 6,
    damage: 3,
    race: Race.Platypus,
    effect: async (combat, summon) => {
        await combat.damagePlayer(summon.damage);
    },
};

const goShawtyItsYourBirthday = new EnemyAction(
    "Go Shawty",
    "It's her birthday.",
    (enemy, _player, combat) => {
        const scaled = {
            ...shawtyTemplate,
            hp: enemy.scaleHealth(shawtyTemplate.hp),
            damage: enemy.scaleDamage(shawtyTemplate.damage),
        };
        enemy.summons.push(createSummon(scaled));
        combat.notify();
    }
);

const bulletproof = new EnemyAction(
    "Bulletproof",
    `Club, the Seal shrugs off the hits — gains ${BULLETPROOF_BLOCK} block plus armor.`,
    (enemy, _player, combat) => {
        enemy.gainBlock(enemy.scaleDamage(BULLETPROOF_BLOCK) + enemy.armor);
        combat.notify();
    }
);

export default class ClubTheSealGuardianEnemy extends Enemy {
    constructor(act: number) {
        super({
            act,
            name: "Club, the Seal",
            health: 40,
            tooltip:
                "Guardian — cycles strike, sandwich heal, Kiss from a Rose (Poison: your fate is sealed), Shawty summons, and Bulletproof block.",
            generateTurnActions: createSequentialActionGenerator(() => [
                clubStrike,
                clubSandwich,
                kissFromARose,
                goShawtyItsYourBirthday,
                bulletproof,
            ]),
        });
    }
}
