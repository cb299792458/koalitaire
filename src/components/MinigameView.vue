<script setup lang="ts">
import { useMinigame } from '../composables/useMinigame';
import { formatStatSymbols } from '../utils/damageSymbol';

const { currentMinigame } = useMinigame();
</script>

<template>
    <div v-if="currentMinigame" class="minigame-view">
        <p class="minigame-description" v-html="formatStatSymbols(currentMinigame.description)"></p>
    </div>
</template>

<style scoped>
.minigame-view {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 24px;
    gap: 16px;
    overflow-y: auto;
}

.minigame-description {
    margin: 0;
    font-family: var(--font-game-mono);
    font-size: 1.1rem;
    text-align: center;
    line-height: 1.5;
    color: #333;
}
</style>
