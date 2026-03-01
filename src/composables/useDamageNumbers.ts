import { ref, type Ref } from 'vue';

export interface DamageNumber {
    id: number;
    value: number;
    type: 'damage' | 'heal' | 'block-gain' | 'block-loss';
    timestamp: number;
}

export type DamageNumberType = DamageNumber['type'];

/** Maps damage number type to container flash class (used by CombatantInfo). */
export const FLASH_CLASS_MAP: Record<DamageNumberType, string> = {
    damage: 'flash-red',
    heal: 'flash-green',
    'block-gain': 'flash-gray',
    'block-loss': 'flash-gray',
};

export function getFlashClassForLatest(numbers: DamageNumber[]): string {
    const latest = numbers[numbers.length - 1];
    return (latest && FLASH_CLASS_MAP[latest.type]) ?? '';
}

const REMOVAL_DELAY_MS = 2000;
let nextId = 0;
let instance: ReturnType<typeof createDamageNumbers> | null = null;

function createDamageNumbers() {
    const playerNumbers = ref<DamageNumber[]>([]);
    const enemyNumbers = ref<DamageNumber[]>([]);

    function addNumberTo(numbersRef: Ref<DamageNumber[]>, value: number, type: DamageNumberType): void {
        const id = nextId++;
        const entry: DamageNumber = { id, value, type, timestamp: Date.now() };
        numbersRef.value.push(entry);
        setTimeout(() => {
            const index = numbersRef.value.findIndex((n) => n.id === id);
            if (index !== -1) numbersRef.value.splice(index, 1);
        }, REMOVAL_DELAY_MS);
    }

    return {
        playerNumbers,
        enemyNumbers,
        addPlayerNumber(value: number, type: DamageNumberType) {
            addNumberTo(playerNumbers, value, type);
        },
        addEnemyNumber(value: number, type: DamageNumberType) {
            addNumberTo(enemyNumbers, value, type);
        },
    };
}

export default function useDamageNumbers() {
    if (!instance) instance = createDamageNumbers();
    return instance;
}
