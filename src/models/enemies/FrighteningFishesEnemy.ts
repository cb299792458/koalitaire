import Enemy, { enemyActionFromKey, type EnemyTurnContext } from "../Enemy";
import EnemyAction, { buildAttackAction } from "../EnemyAction";
import { CombatStatusId } from "../../game/combatStatuses";
import { DamageType } from "../DamageType";
import type Player from "../Player";

function playerHasCrook(player: Player): boolean {
    return player.combatStatuses.some((s) => s.id === CombatStatusId.Crook && s.turnsRemaining > 0);
}

const wreathingShoal = new EnemyAction(
    "Wreathing shoal",
    "The fish mob you until you're Crooked — you take more damage from all sources for several turns.",
    (_enemy, player, combat) => {
        player.addCombatStatus(CombatStatusId.Crook, 3);
        combat.notify();
    }
);

const bigSplash = buildAttackAction({
    name: "Big Splash",
    damage: 3,
    damageTypes: [DamageType.Aoe],
    description:
        "A wave crashes over you and your summons — 3 AoE damage, plus the fishes' attack (less than a direct bite).",
});

function frighteningFishesTurn(context: EnemyTurnContext) {
    if (!playerHasCrook(context.player)) {
        return [wreathingShoal];
    }
    return [enemyActionFromKey("weakAttack"), bigSplash];
}

export default class FrighteningFishesEnemy extends Enemy {
    constructor() {
        super({
            name: "Frightening Fishes",
            health: 22,
            tooltip: "They circle until you're Crooked — then they bite and splash.",
            generateTurnActions: frighteningFishesTurn,
        });
    }
}
