<script setup lang="ts">
import Card from '../Card';

defineProps<{card: Card}>()

const symbols = [
    null, 'A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'
]

</script>

<template>
    <div class="card-view">
        <img v-if="!card.revealed" class="card-back" src="/koala.jpg" alt="Card Back" />
        <p v-else>{{ symbols[card.value] || card.value }}{{ card.suit }}</p>
    </div>
</template>
