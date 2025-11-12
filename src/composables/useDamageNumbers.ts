import { ref, type Ref } from 'vue';

export interface DamageNumber {
    id: number;
    value: number;
    type: 'damage' | 'heal' | 'block-gain' | 'block-loss';
    timestamp: number;
}

let damageNumbersInstance: {
    playerNumbers: Ref<DamageNumber[]>;
    enemyNumbers: Ref<DamageNumber[]>;
    addPlayerNumber: (value: number, type: DamageNumber['type']) => void;
    addEnemyNumber: (value: number, type: DamageNumber['type']) => void;
} | null = null;

let nextId = 0;

function useDamageNumbers() {
    if (damageNumbersInstance) return damageNumbersInstance;

    const playerNumbers = ref<DamageNumber[]>([]);
    const enemyNumbers = ref<DamageNumber[]>([]);

    function addPlayerNumber(value: number, type: DamageNumber['type']): void {
        const id = nextId++;
        playerNumbers.value.push({
            id,
            value,
            type,
            timestamp: Date.now(),
        });
        // Remove after animation completes
        setTimeout(() => {
            const index = playerNumbers.value.findIndex(n => n.id === id);
            if (index !== -1) {
                playerNumbers.value.splice(index, 1);
            }
        }, 2000);
    }

    function addEnemyNumber(value: number, type: DamageNumber['type']): void {
        const id = nextId++;
        enemyNumbers.value.push({
            id,
            value,
            type,
            timestamp: Date.now(),
        });
        // Remove after animation completes
        setTimeout(() => {
            const index = enemyNumbers.value.findIndex(n => n.id === id);
            if (index !== -1) {
                enemyNumbers.value.splice(index, 1);
            }
        }, 2000);
    }

    damageNumbersInstance = {
        playerNumbers,
        enemyNumbers,
        addPlayerNumber,
        addEnemyNumber,
    };

    return damageNumbersInstance;
}

export default useDamageNumbers;

