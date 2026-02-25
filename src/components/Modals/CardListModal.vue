<script setup lang="ts">
    import type Card from '../../models/Card'
    import SingleCard from '../Cards/SingleCard.vue'

    defineProps<{
        title: string
        cards: Card[]
    }>()
</script>

<template>
    <div class="card-list-modal">
        <h2>{{ title }}</h2>
        <div class="card-spread">
            <SingleCard
                v-for="(card, index) in cards"
                :key="index"
                :card="card"
            />
        </div>
    </div>
</template>

<style scoped>
    .card-list-modal {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 50%;
        gap: 1rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .card-spread {
        display: flex;
        flex-wrap: wrap;
    }
</style>
