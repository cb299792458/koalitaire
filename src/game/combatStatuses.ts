/**
 * Combat-only status effects on the player (duration in **player turns**; tick at end of each player turn).
 */
export enum CombatStatusId {
    /** Deal ~33% less damage to the enemy (outgoing × 2/3). */
    Knackered = "knackered",
    /** Take 50% more damage from all sources (incoming × 1.5). */
    Cowed = "cowed",
}

export interface ActiveCombatStatus {
    id: CombatStatusId;
    turnsRemaining: number;
}

/** Multiplier applied to damage the player deals to the enemy (after `beforeDamageToEnemy`). */
export const KNACKERED_OUTGOING_FACTOR = 2 / 3;

/** Multiplier applied to damage the player receives (inside `takeDamage`). */
export const COWED_INCOMING_FACTOR = 1.5;

export const combatStatusLabels: Record<CombatStatusId, string> = {
    [CombatStatusId.Knackered]: "Knackered",
    [CombatStatusId.Cowed]: "Cowed",
};
