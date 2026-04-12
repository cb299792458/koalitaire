import type { CombatEventBus } from "../game/combatEvents";
import type { DamageType } from "./DamageType";
import type Player from "./Player";
import type Enemy from "./Enemy";

/**
 * Passed to {@link Cardifact.onCombatStart}. Uses the combat-scoped player copy and current enemy.
 */
export interface CardifactContext {
    readonly events: CombatEventBus;
    readonly player: Player;
    readonly enemy: Enemy;
    /** Same pipeline as combat damage to the enemy (bus, knackered, etc.). */
    damageEnemy: (rawAmount: number, damageTypes?: DamageType[]) => Promise<void>;
}

/**
 * Permanent run item. Optional hooks:
 * - {@link onAcquire} / {@link onRemove} — run when the cardifact is added or removed from the **run** player (e.g. permanent stat changes).
 * - {@link onCombatStart} — runs at the beginning of each combat (listeners, per-fight buffs; subscribe to {@link CombatEvent} e.g. `enemyDefeated`).
 */
export default abstract class Cardifact {
    readonly id: string;
    readonly name: string;
    readonly description: string;

    constructor(params: { id: string; name: string; description: string }) {
        this.id = params.id;
        this.name = params.name;
        this.description = params.description;
    }

    /**
     * Called when this instance is added to the player's cardifact list (pickup, shop, etc.).
     * Apply permanent bonuses to `player` here; reverse them in {@link onRemove}.
     */
    onAcquire(player: Player): void {
        void player;
    }

    /**
     * Called when this cardifact is removed from the run (sell, lose, replace).
     * Undo anything done in {@link onAcquire}.
     */
    onRemove(player: Player): void {
        void player;
    }

    /**
     * Runs once at the start of each combat (after deck/tableau setup, before `combatStarted`).
     * Override to subscribe to {@link CardifactContext.events} or apply per-combat effects.
     */
    onCombatStart(ctx: CardifactContext): void | Promise<void> {
        void ctx;
    }
}
