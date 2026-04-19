import type { Suit } from "../models/Suit";
import type { DamageType } from "../models/DamageType";

/** Mutable damage routed through {@link Combat.damagePlayer} / {@link Combat.damageEnemy}. */
export interface DamagePayload {
    amount: number;
    damageTypes: DamageType[];
}

/**
 * All combat-scoped game events. Extend this union as you add triggers.
 * Use discriminated `type` so listeners can narrow with switch / if.
 */
export type CombatEvent =
    | { type: "combatStarted" }
    | { type: "playerTurnStarted" }
    | { type: "playerTurnEnded" }
    /** Emitted when the enemy is defeated, after HP sync to the run player, before the victory modal. */
    | { type: "enemyDefeated" }
    /** Before {@link Combat.damagePlayer} applies damage to the player; listeners may mutate `payload`. */
    | { type: "beforeDamageToPlayer"; payload: DamagePayload }
    /** Before damage is applied to the enemy; listeners may mutate `payload`. Player outgoing knackered is applied after emit; enemy incoming crook is applied in {@link Enemy.takeDamage}. */
    | { type: "beforeDamageToEnemy"; payload: DamagePayload }
    /** After {@link Combatant.gainBlock} on the player with amount &gt; 0 (combat player only). */
    | { type: "playerGainedBlock"; amount: number }
    | {
          type: "spellCast";
          /** Spell name after the card resolved (effect already ran). */
          spellName: string;
          suit: Suit | null;
          rank: number;
      };

export type CombatEventListener = (event: CombatEvent) => void | Promise<void>;

/**
 * One bus per {@link Combat} instance. Cards and systems subscribe here;
 * game code calls {@link CombatEventBus.emit} when something happens.
 */
export class CombatEventBus {
    private readonly listeners = new Set<CombatEventListener>();

    /** Register a handler; call the returned function to unsubscribe. */
    subscribe(listener: CombatEventListener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Runs listeners in subscription order; awaits any async listener before the next.
     * Built-in rules subscribe first after each combat {@link CombatEventBus.clear}, so card triggers
     * on `playerTurnEnded` run after tableau/recycling recycle unless they subscribe earlier.
     */
    async emit(event: CombatEvent): Promise<void> {
        for (const listener of [...this.listeners]) {
            await Promise.resolve(listener(event));
        }
    }

    clear(): void {
        this.listeners.clear();
    }
}
