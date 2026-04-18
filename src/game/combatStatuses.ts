/**
 * Combat-only status effects on the player or enemy (duration in **player turns**; tick at end of each player turn).
 *
 * On the **player**: Wonky increases damage taken; Knackered reduces damage dealt to the enemy.
 * On the **enemy**: Wonky increases damage taken from the player; Knackered reduces damage the enemy deals to the player.
 */
export enum CombatStatusId {
    /** Deal ~33% less damage to the enemy (outgoing × 2/3). */
    Knackered = "knackered",
    /** Take 50% more damage from all sources (incoming × 1.5). */
    Wonky = "wonky",
}

export interface ActiveCombatStatus {
    id: CombatStatusId;
    turnsRemaining: number;
}

/** Multiplier applied to damage the player deals to the enemy (after `beforeDamageToEnemy`). */
export const KNACKERED_OUTGOING_FACTOR = 2 / 3;

/** Multiplier applied to damage the player receives (inside `takeDamage`). */
export const WONKY_INCOMING_FACTOR = 1.5;

export const combatStatusLabels: Record<CombatStatusId, string> = {
    [CombatStatusId.Knackered]: "Knackered",
    [CombatStatusId.Wonky]: "Wonky",
};

/** Tooltip copy for combat status rows and card keywords (player or enemy). */
export const COMBAT_STATUS_TOOLTIPS: Record<CombatStatusId, string> = {
    [CombatStatusId.Knackered]:
        "Knackered: Damage this combatant deals is multiplied by about two-thirds (~33% less).",
    [CombatStatusId.Wonky]:
        "Wonky: Damage this combatant takes is multiplied by 1.5 (50% more from each hit).",
};

export function getCombatStatusTooltip(id: CombatStatusId): string {
    return COMBAT_STATUS_TOOLTIPS[id];
}
