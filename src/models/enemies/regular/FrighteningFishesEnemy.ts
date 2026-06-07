import Enemy, { enemyActionFromKey, type EnemyTurnContext } from "../../Enemy";
import EnemyAction from "../../EnemyAction";
import { CombatStatusId } from "../../../game/combatStatuses";
import type Player from "../../Player";

function playerHasDecroded(player: Player): boolean {
    return player.combatStatuses.some((s) => s.id === CombatStatusId.Decroded && s.turnsRemaining > 0);
}

const wreathingShoal = new EnemyAction(
    "Wreathing shoal",
    "The fish mob you until you're Decroded — you take more damage from all sources for two turns.",
    (_enemy, player, combat) => {
        player.addCombatStatus(CombatStatusId.Decroded, 2);
        combat.notify();
    }
);

function frighteningFishesTurn(context: EnemyTurnContext) {
    if (!playerHasDecroded(context.player)) {
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
            tooltip: "They circle until you're Decroded — then they nip like any other regular.",
            generateTurnActions: frighteningFishesTurn,
        });
    }
}
