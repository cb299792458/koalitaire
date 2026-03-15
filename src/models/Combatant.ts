import { DamageType } from "./DamageType";
import type Summon from "./Summon";

export type DamageNumberType = 'damage' | 'block-loss' | 'block-gain' | 'heal';

/**
 * Base class for combat entities that can take damage, have block, armor, and summons.
 * Player and Enemy extend this and implement addDamageNumber for their UI.
 */
export default abstract class Combatant {
    name: string;
    portrait: string;
    /** Tooltip text shown on hover. Defaults to name if not set. */
    tooltip: string;
    health: number;
    maxHealth: number;
    /** When > 0, one instance of damage is ignored and dodge is reduced by 1. Checked before block. */
    dodge: number = 0;
    block: number = 0;
    armor: number;
    summons: Summon[] = [];

    constructor(params: { name: string; portrait: string; health: number; armor: number; tooltip?: string }) {
        this.name = params.name;
        this.portrait = params.portrait;
        this.tooltip = params.tooltip ?? params.name;
        this.health = params.health;
        this.maxHealth = params.health;
        this.armor = params.armor;
    }

    /** Subclasses implement to show damage numbers in the correct UI (player vs enemy). */
    protected abstract addDamageNumber(amount: number, type: DamageNumberType): void;

    /** Called when this combatant's health drops to 0 or below. Override for player death modal etc. */
    protected onDeath(): void {}

    takeDamage(amount: number, damageTypes: DamageType[] = []): void {
        const effectiveDamage = amount;

        const ignoresBlock = damageTypes.includes(DamageType.Magic);
        const skipsSummons = damageTypes.includes(DamageType.Ranged);
        const isBackstab = damageTypes.includes(DamageType.Backstab);
        const isAoe = damageTypes.includes(DamageType.Aoe);

        let damageToCombatant = effectiveDamage;

        if (isAoe && this.summons.length > 0) {
            for (let i = this.summons.length - 1; i >= 0; i--) {
                const summon = this.summons[i]!;
                summon.hp -= effectiveDamage;
                if (summon.hp <= 0) {
                    summon.hp = 0;
                    this.summons.splice(i, 1);
                }
            }
            if (effectiveDamage > 0) {
                this.addDamageNumber(effectiveDamage, 'damage');
            }
        } else if (this.summons.length > 0 && !skipsSummons) {
            // Excess damage carries over: through summons (front to back, or back to front for Backstab), then to combatant
            const start = isBackstab ? this.summons.length - 1 : 0;
            const step = isBackstab ? -1 : 1;
            const end = isBackstab ? -1 : this.summons.length;
            let remaining = effectiveDamage;
            for (let i = start; isBackstab ? i > end : i < end; i += step) {
                if (remaining <= 0) break;
                const summon = this.summons[i]!;
                const hit = Math.min(remaining, summon.hp);
                summon.hp -= hit;
                remaining -= hit;
                if (summon.hp <= 0) {
                    summon.hp = 0;
                    this.summons.splice(i, 1);
                }
                if (hit > 0) {
                    this.addDamageNumber(hit, 'damage');
                }
            }
            damageToCombatant = remaining;
        } else if (isBackstab && this.summons.length === 0) {
            damageToCombatant = effectiveDamage * 2;
        }

        // Dodge: if combatant has dodge, ignore this damage and consume 1 dodge
        if (this.dodge > 0) {
            this.dodge -= 1;
            return;
        }

        let remainingDamage = damageToCombatant;
        if (!ignoresBlock) {
            const previousBlock = this.block;
            const blockLost = Math.min(damageToCombatant, previousBlock);
            remainingDamage = Math.max(0, damageToCombatant - this.block);
            this.block = Math.max(0, this.block - damageToCombatant);
            if (blockLost > 0) {
                this.addDamageNumber(blockLost, 'block-loss');
            }
        }
        if (remainingDamage > 0) {
            this.health -= remainingDamage;
            this.addDamageNumber(remainingDamage, 'damage');
        }

        if (this.health <= 0) {
            this.health = 0;
            this.onDeath();
        }
    }

    gainBlock(amount: number): void {
        this.block += amount;
        this.addDamageNumber(amount, 'block-gain');
    }

    gainHealth(amount: number): void {
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
        this.addDamageNumber(amount, 'heal');
    }
}
