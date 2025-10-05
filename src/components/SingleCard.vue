<script setup lang="ts">
import type Card from '../game/Card';


    const { card, selectedCard, selectCard } = defineProps<{
        card: Card,
        selectedCard?: Card | null
        selectCard?: (card: Card | null) => void
    }>()

    const symbols = [
        null, 'A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'
    ]

    const emit = defineEmits<{
        (e: 'clicked'): void;
    }>();

    function handleClick(event: MouseEvent) {
        if (selectedCard) {
            if (card === selectedCard) {
                selectCard?.(null); // Deselect the card
            } else {
                emit('clicked'); // Emit clicked event
            }
        } else if (card.revealed) {
            selectCard?.(card); // Select the card
            event.stopPropagation(); // Prevent event from bubbling up
        }
    }
</script>

<template>
    <div class="card-view" @click="handleClick" :class="{ selected: selectedCard === card }">
        <img v-if="!card.revealed" class="card-back" src="/card_backs/koala.jpg" alt="Card Back" />
        <p v-else>{{ symbols[card.rank] || card.rank }}{{ card.suit }}</p>
    </div>
</template>
