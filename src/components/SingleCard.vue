<script setup lang="ts">
    import { computed } from 'vue';
    import type Card from '../models/Card';

    const { card, selectedCard } = defineProps<{
        card: Card,
        selectedCard?: Card | null
    }>()

    const symbols = [
        null, 'A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'
    ]

    const animation = computed(() => card.animation);
</script>

<template>
    <div class="card-view" :class="{ 
        selected: selectedCard === card,
        [card.animation]: !!animation,
    }">
        <img v-if="!card.revealed" class="card-back" src="/card_backs/koala.jpg" alt="Card Back" />
        <div class="card-front" v-else>
            <div class="card-top" :class="card.suit">
                {{ symbols[card.rank] || card.rank }}{{ card.suit }} {{ card.name }}
            </div>
            <p class="card-description">{{ card.description }}</p>
        </div>
    </div>
</template>
