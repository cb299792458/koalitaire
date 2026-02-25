<script setup lang="ts">
import { useEvent } from '../composables/useEvent';

const { currentEvent } = useEvent();
</script>

<template>
    <div v-if="currentEvent" class="event-view">
        <p class="event-description">{{ currentEvent.description }}</p>
    </div>
</template>

<style scoped>
.event-view {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 24px;
    gap: 16px;
    overflow-y: auto;
}

.event-description {
    margin: 0;
    font-size: 1.1rem;
    text-align: center;
    line-height: 1.5;
    color: #333;
}
</style>
