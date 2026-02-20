<script setup lang="ts">
    import GamePage from './components/GamePage.vue';
    import TownPage from './components/TownPage.vue';
    import { useTown } from './composables/useTown';

    const town = useTown();
    const isInTown = town.isInTown;
</script>

<template>
    <TownPage v-if="isInTown" />
    <GamePage v-else />
</template>
