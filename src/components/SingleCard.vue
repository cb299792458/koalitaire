<script setup lang="ts">
    import type Card from '../models/Card';

    const { card, selectedCard } = defineProps<{
        card: Card,
        selectedCard?: Card | null
    }>()

    const symbols = [
        null, 'A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'
    ]
</script>

<template>
    <div class="card-view" :class="{ selected: selectedCard === card }">
        <img v-if="!card.revealed" class="card-back" src="/card_backs/koala.jpg" alt="Card Back" />
        <p v-else>
            {{ symbols[card.rank] || card.rank }}{{ card.suit }} <br />
            <span class="card-description">{{ card.description }}</span>
        </p>
    </div>
</template>
