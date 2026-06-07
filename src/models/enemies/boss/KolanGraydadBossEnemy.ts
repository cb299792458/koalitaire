import Enemy, { createSequentialActionGenerator } from "../../Enemy";
import EnemyAction from "../../EnemyAction";
import { CombatStatusId } from "../../../game/combatStatuses";

/** Base hit before Kolan's attack stat; scales with act like other enemy actions. */
const KNIFE_HAND_DAMAGE = 24;
const DECRODED_TURNS = 2;
const TITLE_CARD_BLOCK = 16;
const MIMIC_POWER_STAT_BONUS = 5;

const viltrumiteKnifeHand = new EnemyAction(
    "Viltrumite Knife Hand",
    `Kolan Graydad drives a brutal knife-hand strike for ${KNIFE_HAND_DAMAGE} damage plus attack, then leaves you Decroded for ${DECRODED_TURNS} turns — you take 50% more damage from all sources.`,
    async (enemy, player, combat) => {
        await combat.damagePlayer(enemy.scaleDamage(KNIFE_HAND_DAMAGE) + enemy.attack);
        player.addCombatStatus(CombatStatusId.Decroded, DECRODED_TURNS);
        combat.notify();
    }
);

const titleCardDrop = new EnemyAction(
    "Title Card Drop",
    `Kolan Graydad slams a title card onto the field — gains ${TITLE_CARD_BLOCK} block plus armor.`,
    (enemy, _player, combat) => {
        enemy.gainBlock(enemy.scaleDamage(TITLE_CARD_BLOCK) + enemy.armor);
        combat.notify();
    }
);

const lookWhatTheyNeed = new EnemyAction(
    "Look What They Need to Mimic a Fraction of Our Power",
    `Kolan Graydad scoffs at pretenders — gains +${MIMIC_POWER_STAT_BONUS} attack and +${MIMIC_POWER_STAT_BONUS} armor (scaled by act).`,
    (enemy, _player, combat) => {
        const bonus = enemy.scaleStat(MIMIC_POWER_STAT_BONUS);
        enemy.attack += bonus;
        enemy.armor += bonus;
        combat.notify();
    }
);

export default class KolanGraydadBossEnemy extends Enemy {
    constructor(act: number) {
        super({
            act,
            name: "Kolan Graydad",
            health: 80,
            tooltip:
                "Your father, the 12th Koala King.",
            generateTurnActions: createSequentialActionGenerator(() => [
                viltrumiteKnifeHand,
                titleCardDrop,
                lookWhatTheyNeed,
            ]),
        });
    }
}
