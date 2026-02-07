<script setup lang="ts">
    import type Card from '../models/Card';
    import SingleCard from './SingleCard.vue';

    defineProps<{ trash: Card[] }>()
</script>

<template>
    <div class="modal">
        <h2>Trash</h2>
        <div class="card-spread">
            <SingleCard
                v-for="(card, index) in trash"
                :key="index"
                :card="card"
            />
        </div>
    </div>
</template>
