<script setup lang="ts">
    import GamePage from './components/GamePage.vue';
    import TownPage from './components/TownPage.vue';
    import { useTown } from './composables/useTown';

    const town = useTown();
    // Unwrap ref so template sees boolean; refs on plain objects don't auto-unwrap in template
    const isInTown = town.isInTown;
</script>

<template>
    <TownPage v-if="isInTown" />
    <GamePage v-else />
</template>
