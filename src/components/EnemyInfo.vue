<script setup lang="ts">
    import { computed } from 'vue';
    import type Enemy from '../models/Enemy';
    import FloatingNumber from './FloatingNumber.vue';
    import SummonDisplay from './SummonDisplay.vue';
    import useDamageNumbers from '../composables/useDamageNumbers';

    const props = defineProps<{
        enemy: Enemy | null;
    }>();

    const { enemyNumbers } = useDamageNumbers();

    const flashClass = computed(() => {
        if (enemyNumbers.value.length === 0) return '';
        const latest = enemyNumbers.value[enemyNumbers.value.length - 1];
        if (!latest) return '';
        if (latest.type === 'damage' || latest.type === 'heal') {
            return 'flash-red';
        }
        if (latest.type === 'block-gain' || latest.type === 'block-loss') {
            return 'flash-gray';
        }
        return '';
    });
</script>

<template>
    <div :class="['enemy-info', flashClass]" v-if="props.enemy">
        <FloatingNumber
            v-for="number in enemyNumbers"
            :key="number.id"
            :number="number"
        />
        <h2>{{ props.enemy.name }}</h2>
        <img :src="props.enemy.portrait" alt="Enemy Portrait" width="100%"/>
        <p>Health: {{ props.enemy.health }} / {{ props.enemy.maxHealth }}</p>
        <p>Block: {{ props.enemy.block }}</p>
        
        <p>Attack: {{ props.enemy.attack }}</p>
        <p>Armor: {{ props.enemy.armor }}</p>

        <br/>
        <p>Actions: {{ props.enemy.actions }}</p>
        <p v-for="(action, index) in props.enemy.impendingActions" :key="index">
            {{ action.name }}: {{ action.description }}
        </p>
        
        <div class="summons-list" v-if="props.enemy.summons.length">
            <h3>Summons</h3>
            <SummonDisplay
                v-for="(summon, index) in props.enemy.summons"
                :key="index"
                :summon="summon"
            />
        </div>
    </div>
</template>
