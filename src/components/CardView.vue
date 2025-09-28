<script setup lang="ts">
import Card from '../Card';

defineProps<{card: Card}>()

</script>

<template>
    <div class="card-view">
        <img v-if="!card.revealed" class="card-back" src="/koala.jpg" alt="Card Back" />
        <h2 v-else>{{ card.value }}{{ card.suit }}</h2>
    </div>
</template>
