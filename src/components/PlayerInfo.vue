<script setup lang="ts">
    import { computed } from 'vue';
    import type Player from '../models/Player';
    import FloatingNumber from './FloatingNumber.vue';
    import useDamageNumbers from '../composables/useDamageNumbers';

    const props = defineProps<{
        player: Player | null;
    }>();

    const { playerNumbers } = useDamageNumbers();

    const flashClass = computed(() => {
        if (playerNumbers.value.length === 0) return '';
        const latest = playerNumbers.value[playerNumbers.value.length - 1];
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
    <div :class="['player-info', flashClass]" v-if="props.player">
        <FloatingNumber
            v-for="number in playerNumbers"
            :key="number.id"
            :number="number"
        />
        <h2>{{ props.player.name }}</h2>
        <img :src="props.player.portrait" alt="Player Portrait" width="100%"/>
        <p>Health: {{ props.player.health }} / {{ props.player.maxHealth }}</p>
        <p>Block: {{ props.player.block }}</p>
        <p>Mana Crystals: {{ props.player.manaCrystals }}</p>
        
        <p>Appeal: {{ props.player.appeal }}</p>
        <p>Attack: {{ props.player.attack }}</p>
        <p>Armor: {{ props.player.armor }}</p>
        <p>Agility: {{ props.player.agility }}</p>
        <p>Arcane: {{ props.player.arcane }}</p>
        
        <p>Gold: {{ props.player.gold }}</p>
        <p>Deck Size: {{ props.player.deck.length }}</p>
    </div>
</template>
