<script setup lang="ts">
    import type Card from '../models/Card';
    import SingleCard from './SingleCard.vue';

    defineProps<{ compost: Card[] }>()
</script>

<template>
    <div class="modal">
        <h2>Compost</h2>
        <div class="card-spread">
            <SingleCard
                v-for="(card, index) in compost"
                :key="index"
                :card="card"
            />
        </div>
    </div>
</template>
