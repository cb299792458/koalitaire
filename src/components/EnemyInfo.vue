<script setup lang="ts">
    import type Enemy from '../models/Enemy';

    const props = defineProps<{
        enemy: Enemy | null;
    }>();
</script>

<template>
    <div class="enemy-info" v-if="props.enemy">
        <h2>{{ props.enemy.name }}</h2>
        <img :src="props.enemy.portrait" alt="enemy Portrait" width="100%"/>
        <p>Health: {{ props.enemy.health }} / {{ props.enemy.maxHealth }}</p>
        <p>Block: {{ props.enemy.block }}</p>
        
        <p>Attack: {{ props.enemy.attack }}</p>
        <p>Armor: {{ props.enemy.armor }}</p>

        <br/>
        <p>Actions: {{ props.enemy.actions }}</p>
        <p v-for="action in props.enemy.impendingActions" :key="props.enemy.impendingActions.indexOf(action)">
            {{ action.name }}: {{ action.description }}
        </p>
    </div>
    <div v-else>
    </div>
</template>
