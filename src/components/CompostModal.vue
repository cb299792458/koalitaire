<script setup lang="ts">
    import type Card from '../models/Card';
    import SingleCard from './SingleCard.vue';

    defineProps<{ compost: Card[] }>()

    const emit = defineEmits<{
        (e: 'close'): void
    }>()
</script>

<template>
    <div class="modal">
        <h2>Compost</h2>
        <div class="card-spread">
            <SingleCard
                v-for="(card, index) in compost"
                :key="index"
                :card="card"
                @click="$emit('close')"
            />
        </div>
    </div>
</template>
