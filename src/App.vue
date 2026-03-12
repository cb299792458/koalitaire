<script setup lang="ts">
    import { onMounted, onUnmounted } from 'vue';
    import GamePage from './components/GamePage.vue';
    import TownPage from './components/TownPage.vue';
    import { useTown } from './composables/useTown';
    import { playButtonClick } from './utils/sounds';

    const town = useTown();
    const isInTown = town.isInTown;

    function handleButtonClick(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (target.closest('button')) {
            playButtonClick();
        }
    }

    onMounted(() => {
        document.addEventListener('click', handleButtonClick);
    });

    onUnmounted(() => {
        document.removeEventListener('click', handleButtonClick);
    });
</script>

<template>
    <TownPage v-if="isInTown" />
    <GamePage v-else />
</template>
