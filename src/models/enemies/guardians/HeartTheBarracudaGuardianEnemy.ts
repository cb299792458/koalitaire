/** Design reference: Heart (the rock band). */
import Enemy, { createSequentialActionGenerator } from "../../Enemy";
import EnemyAction, { buildAttackAction } from "../../EnemyAction";

const TAIL_SLASH_DAMAGE = 8;
const BITE_DAMAGE = 4;
const PUT_IT_TOGETHER_ATTACK_BONUS = 5;

const tailSlash = buildAttackAction({
    name: "Tail Slash",
    damage: TAIL_SLASH_DAMAGE,
    description: `Tail Slash — it never fails. Heart, the Barracuda hits for ${TAIL_SLASH_DAMAGE} damage, plus attack.`,
});

const lieInTheWeeds = new EnemyAction(
    "Lie in the weeds",
    "Heart, the Barracuda lies in the weeds — gains 1 dodge.",
    (enemy, _player, combat) => {
        enemy.dodge += 1;
        combat.notify();
    }
);

const bite = buildAttackAction({
    name: "Bite",
    damage: BITE_DAMAGE,
    description: `Heart, the Barracuda bites for ${BITE_DAMAGE} damage, plus attack.`,
});

const putItAllTogether = new EnemyAction(
    "Put it all together",
    `Heart, the Barracuda puts it all together — gains +${PUT_IT_TOGETHER_ATTACK_BONUS} attack (scaled by act).`,
    (enemy, _player, combat) => {
        enemy.attack += enemy.scaleStat(PUT_IT_TOGETHER_ATTACK_BONUS);
        combat.notify();
    }
);

export default class HeartTheBarracudaGuardianEnemy extends Enemy {
    constructor(act: number) {
        super({
            act,
            name: "Heart, the Barracuda",
            health: 40,
            tooltip:
                "Guardian — cycles Tail Slash, Lie in the weeds, Bite, and Put it all together (attack buff).",
            generateTurnActions: createSequentialActionGenerator(() => [
                tailSlash,
                lieInTheWeeds,
                bite,
                putItAllTogether,
            ]),
        });
    }
}
