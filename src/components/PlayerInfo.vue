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
        
        <p>Strength: {{  props.player.strength }}</p>
        <p>Dexterity: {{  props.player.dexterity }}</p>
        <p>Intelligence: {{ props.player.intelligence }}</p>
        <p>Charisma: {{ props.player.charisma }}</p>
        
        <p>Gold: {{  props.player.gold }}</p>
        <p>Deck Size: {{ props.player.deck.length }}</p>
    </div>
    <div v-else>
    </div>
</template>
