import Enemy, { enemyActionFromKey, type EnemyTurnContext } from "../../Enemy";
import EnemyAction from "../../EnemyAction";
import { CombatStatusId } from "../../../game/combatStatuses";
import type Player from "../../Player";

function playerHasCrook(player: Player): boolean {
    return player.combatStatuses.some((s) => s.id === CombatStatusId.Crook && s.turnsRemaining > 0);
}

const wreathingShoal = new EnemyAction(
    "Wreathing shoal",
    "The fish mob you until you're Crooked — you take more damage from all sources for two turns.",
    (_enemy, player, combat) => {
        player.addCombatStatus(CombatStatusId.Crook, 2);
        combat.notify();
    }
);

function frighteningFishesTurn(context: EnemyTurnContext) {
    if (!playerHasCrook(context.player)) {
        return [wreathingShoal];
    }
    return [enemyActionFromKey("weakAttack")];
}

export default class FrighteningFishesEnemy extends Enemy {
    constructor(act: number) {
        super({
            act,
            name: "Frightening Fishes",
            health: 18,
            tooltip: "They circle until you're Crooked — then they nip like any other regular.",
            generateTurnActions: frighteningFishesTurn,
        });
    }
}
