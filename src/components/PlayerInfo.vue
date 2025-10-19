<script setup lang="ts">
    import type Player from '../models/Player';

    const props = defineProps<{
        player: Player | null;
    }>();
</script>

<template>
    <div class="player-info" v-if="props.player">
        <h2>{{ props.player.name }}</h2>
        <img :src="props.player.portrait" alt="Player Portrait" width="100%"/>
        <p>Health: {{ props.player.health }} / {{ props.player.maxHealth }}</p>
        
        <p>Appeal: {{ props.player.appeal }}</p>
        <p>Attack: {{ props.player.attack }}</p>
        <p>Armor: {{ props.player.armor }}</p>
        <p>Agility: {{ props.player.agility }}</p>
        <p>Arcane: {{ props.player.arcane }}</p>
        
        <p>Gold: {{  props.player.gold }}</p>
        <p>Deck Size: {{ props.player.deck.length }}</p>
    </div>
    <div v-else>
    </div>
</template>
