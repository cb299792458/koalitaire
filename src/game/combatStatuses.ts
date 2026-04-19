/**
 * Combat-only status effects on the player or enemy (duration in **player turns**; tick at end of each player turn).
 *
 * On the **player**: Crook increases damage taken; Knackered reduces damage dealt to the enemy.
 * On the **enemy**: Crook increases damage taken from the player; Knackered reduces damage the enemy deals to the player.
 *
 * **Poisoned**: At end of each player turn (after recycling the tableau, before your summons attack), applies
 * `loseLife` for an amount equal to remaining duration, then duration ticks down with other statuses.
 * Does not use `takeDamage` (no summons, block, dodge, knackered, crook, or beforeDamage hooks).
 * Re-applying any status **adds** to its remaining turns.
 */
export enum CombatStatusId {
    /** Deal ~33% less damage to the enemy (outgoing × 2/3). */
    Knackered = "knackered",
    /** Take 50% more damage from all sources (incoming × 1.5). */
    Crook = "crook",
    /** End-of-turn DoT before your summons; damage this turn equals turns remaining. */
    Poisoned = "poisoned",
}

export interface ActiveCombatStatus {
    id: CombatStatusId;
    turnsRemaining: number;
}

/** Multiplier applied to damage the player deals to the enemy (after `beforeDamageToEnemy`). */
export const KNACKERED_OUTGOING_FACTOR = 2 / 3;

/** Multiplier applied to damage the player receives (inside `takeDamage`). */
export const CROOK_INCOMING_FACTOR = 1.5;

export const combatStatusLabels: Record<CombatStatusId, string> = {
    [CombatStatusId.Knackered]: "Knackered",
    [CombatStatusId.Crook]: "Crook",
    [CombatStatusId.Poisoned]: "Poisoned",
};

/** Tooltip copy for combat status rows and card keywords (player or enemy). */
export const COMBAT_STATUS_TOOLTIPS: Record<CombatStatusId, string> = {
    [CombatStatusId.Knackered]:
        "Knackered: Deals 33% less damage (rounded down).",
    [CombatStatusId.Crook]:
        "Crook: Takes 50% more damage (rounded down).",
    [CombatStatusId.Poisoned]:
        "Poisoned: At end of your turn, loses life equal to the amount of Poisoned.",
};

export function getCombatStatusTooltip(id: CombatStatusId): string {
    return COMBAT_STATUS_TOOLTIPS[id];
}
