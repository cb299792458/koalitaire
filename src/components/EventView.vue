<script setup lang="ts">
import { computed } from 'vue';
import { useEvent } from '../composables/useEvent';

const eventState = useEvent();
const currentEvent = computed(() => eventState.currentEvent.value);
</script>

<template>
    <div class="event-view" v-if="currentEvent">
        <p class="event-description">{{ currentEvent.description }}</p>
    </div>
</template>
