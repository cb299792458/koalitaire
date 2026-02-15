<script setup lang="ts">
    import type Summon from '../models/Summon';

    defineProps<{
        summon: Summon;
    }>();
</script>

<template>
    <div class="summon-display">
        <span class="summon-name">{{ summon.name }}</span>
        <span class="summon-hp">{{ summon.hp }} / {{ summon.maxhp }}</span>
        <span class="summon-power">⚔ {{ summon.power }}</span>
        <div class="summon-tooltip">{{ summon.description }}</div>
    </div>
</template>
