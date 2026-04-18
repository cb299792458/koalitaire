import type { Combat } from "../composables/useCombat";
import type Enemy from "../models/Enemy";
import type Player from "../models/Player";
import type Summon from "../models/Summon";
import { DamageType } from "../models/DamageType";
import { Race } from "../models/Summon";

/** HP loss if the current turn were ended immediately (combat resolution only; not tableau recycling). */
export interface EndTurnDamagePreview {
    playerHpLoss: number;
    /** Block consumed by hits that resolve before end of turn (enemy actions + summons); not net change if you gain block. */
    playerBlockLoss: number;
    /** Parallel to `player.summons` order at snapshot time. */
    playerSummonHpLosses: number[];
    enemyHpLoss: number;
    /** Parallel to `enemy.summons` order at snapshot time. */
    enemySummonHpLosses: number[];
}

interface SimSummon {
    hp: number;
    previewIndex: number;
    race: Race;
    damage: number;
    effect: (combat: Combat) => void | Promise<void>;
}

/** Enemy-side state + fields mutated by {@link import("../models/EnemyAction").default} effects. */
interface SimEnemyState {
    health: number;
    maxHealth: number;
    block: number;
    dodge: number;
    summons: SimSummon[];
    attack: number;
    armor: number;
    actions: number;
    gainBlock(amount: number): void;
    gainHealth(amount: number): void;
}

/**
 * Mirrors {@link import("../models/Combatant").default.takeDamage} for preview (no damage numbers / onDeath).
 */
function applyDamageToSimBoard(
    board: { health: number; block: number; dodge: number; summons: SimSummon[] },
    effectiveDamage: number,
    damageTypes: DamageType[]
): void {
    const ignoresBlock = damageTypes.includes(DamageType.Magic);
    const skipsSummons = damageTypes.includes(DamageType.Ranged);
    const isBackstab = damageTypes.includes(DamageType.Backstab);
    const isAoe = damageTypes.includes(DamageType.Aoe);

    let damageToCombatant = effectiveDamage;

    if (isAoe && board.summons.length > 0) {
        for (let i = board.summons.length - 1; i >= 0; i--) {
            const summon = board.summons[i]!;
            summon.hp -= effectiveDamage;
            if (summon.hp <= 0) {
                summon.hp = 0;
                board.summons.splice(i, 1);
            }
        }
    } else if (board.summons.length > 0 && !skipsSummons) {
        const start = isBackstab ? board.summons.length - 1 : 0;
        const step = isBackstab ? -1 : 1;
        const end = isBackstab ? -1 : board.summons.length;
        let remaining = effectiveDamage;
        for (let i = start; isBackstab ? i > end : i < end; i += step) {
            if (remaining <= 0) break;
            const summon = board.summons[i]!;
            const hit = Math.min(remaining, summon.hp);
            summon.hp -= hit;
            remaining -= hit;
            if (summon.hp <= 0) {
                summon.hp = 0;
                board.summons.splice(i, 1);
            }
        }
        damageToCombatant = remaining;
    } else if (isBackstab && board.summons.length === 0) {
        damageToCombatant = effectiveDamage * 2;
    }

    if (board.dodge > 0) {
        board.dodge -= 1;
        return;
    }

    let remainingDamage = damageToCombatant;
    if (!ignoresBlock) {
        remainingDamage = Math.max(0, damageToCombatant - board.block);
        board.block = Math.max(0, board.block - damageToCombatant);
    }
    if (remainingDamage > 0) {
        board.health -= remainingDamage;
    }
    if (board.health < 0) {
        board.health = 0;
    }
}

function cloneSummons(summons: Summon[]): SimSummon[] {
    return summons.map((s, previewIndex) => ({
        hp: s.hp,
        previewIndex,
        race: s.race,
        damage: s.damage,
        effect: s.effect,
    }));
}

function snapshotSummonHpLosses(initial: Map<number, number>, finalSummons: SimSummon[]): number[] {
    const count = initial.size;
    const finalHp = new Map<number, number>();
    for (const s of finalSummons) {
        finalHp.set(s.previewIndex, s.hp);
    }
    const out: number[] = [];
    for (let i = 0; i < count; i++) {
        const startHp = initial.get(i) ?? 0;
        const endHp = finalHp.get(i) ?? 0;
        out.push(Math.max(0, startHp - endHp));
    }
    return out;
}

/**
 * Simulates {@link Combat}'s post-`playerTurnEnded` combat (summons → enemy actions → enemy summon effects)
 * without mutating the real combat or emitting events.
 */
export async function computeEndTurnDamagePreviewAsync(combat: Combat): Promise<EndTurnDamagePreview> {
    const player = combat.player;
    const enemy = combat.enemy;
    if (!player || !enemy) {
        return {
            playerHpLoss: 0,
            playerBlockLoss: 0,
            playerSummonHpLosses: [],
            enemyHpLoss: 0,
            enemySummonHpLosses: [],
        };
    }

    const initialPlayerHp = player.health;
    const initialPlayerBlock = player.block;
    const initialEnemyHp = enemy.health;

    const playerSummonInitial = new Map<number, number>();
    player.summons.forEach((s, i) => playerSummonInitial.set(i, s.hp));
    const enemySummonInitial = new Map<number, number>();
    enemy.summons.forEach((s, i) => enemySummonInitial.set(i, s.hp));

    const playerBoard = {
        health: player.health,
        maxHealth: player.maxHealth,
        block: player.block,
        dodge: player.dodge,
        summons: cloneSummons(player.summons),
    };

    const enemyOutgoing = enemy.outgoingDamageMultiplier;
    const playerIncoming = player.incomingDamageMultiplier;
    const playerOutgoing = player.outgoingDamageMultiplier;
    const enemyIncoming = enemy.incomingDamageMultiplier;

    const enemySim: SimEnemyState = {
        health: enemy.health,
        maxHealth: enemy.maxHealth,
        block: enemy.block,
        dodge: enemy.dodge,
        summons: cloneSummons(enemy.summons),
        attack: enemy.attack,
        armor: enemy.armor,
        actions: enemy.actions,
        gainBlock(amount: number) {
            this.block += amount;
        },
        gainHealth(amount: number) {
            this.health += amount;
            if (this.health > this.maxHealth) {
                this.health = this.maxHealth;
            }
        },
    };

    const simPlayer = {
        get summons() {
            return playerBoard.summons;
        },
        gainBlock(amount: number) {
            playerBoard.block += amount;
        },
        gainHealth(amount: number) {
            playerBoard.health += amount;
            if (playerBoard.health > playerBoard.maxHealth) {
                playerBoard.health = playerBoard.maxHealth;
            }
        },
    };

    const previewCombat = {
        player: simPlayer as unknown as Player,
        enemy: enemySim as unknown as Enemy,
        damagePlayer(rawAmount: number, damageTypes: DamageType[] = []) {
            const afterEnemyOutgoing = Math.max(0, Math.floor(rawAmount * enemyOutgoing));
            const scaled = Math.max(0, Math.floor(afterEnemyOutgoing * playerIncoming));
            applyDamageToSimBoard(playerBoard, scaled, damageTypes);
        },
        damageEnemy(rawAmount: number, damageTypes: DamageType[] = []) {
            const scaled = Math.max(0, Math.floor(rawAmount * playerOutgoing));
            const scaledIncoming = Math.max(0, Math.floor(scaled * enemyIncoming));
            applyDamageToSimBoard(enemySim, scaledIncoming, damageTypes);
        },
    } as Combat;

    /** Snapshot order at “press End Turn”; skip if that summon is gone before its attack (survive to attack). */
    const playerSummonWave = [...playerBoard.summons];
    for (const sim of playerSummonWave) {
        if (enemySim.health <= 0) {
            continue;
        }
        if (!playerBoard.summons.includes(sim)) {
            continue;
        }
        const base = Math.max(0, Math.floor(Number(sim.damage) || 0));
        previewCombat.damageEnemy(base);
        await sim.effect(previewCombat);
    }

    if (enemySim.health <= 0) {
        return {
            playerHpLoss: Math.max(0, initialPlayerHp - playerBoard.health),
            playerBlockLoss: Math.max(0, initialPlayerBlock - playerBoard.block),
            playerSummonHpLosses: snapshotSummonHpLosses(playerSummonInitial, playerBoard.summons),
            enemyHpLoss: Math.max(0, initialEnemyHp - enemySim.health),
            enemySummonHpLosses: snapshotSummonHpLosses(enemySummonInitial, enemySim.summons),
        };
    }

    enemySim.dodge = 0;
    enemySim.block = 0;

    for (const action of enemy.impendingActions) {
        await action.effect(enemySim as unknown as Enemy, simPlayer as unknown as Player, previewCombat);
    }

    const enemySummonOrder = [...enemySim.summons];
    for (const sim of enemySummonOrder) {
        if (!enemySim.summons.includes(sim)) {
            continue;
        }
        const base = Math.max(0, Math.floor(Number(sim.damage) || 0));
        previewCombat.damagePlayer(base);
        await sim.effect(previewCombat);
    }

    return {
        playerHpLoss: Math.max(0, initialPlayerHp - playerBoard.health),
        playerBlockLoss: Math.max(0, initialPlayerBlock - playerBoard.block),
        playerSummonHpLosses: snapshotSummonHpLosses(playerSummonInitial, playerBoard.summons),
        enemyHpLoss: Math.max(0, initialEnemyHp - enemySim.health),
        enemySummonHpLosses: snapshotSummonHpLosses(enemySummonInitial, enemySim.summons),
    };
}
