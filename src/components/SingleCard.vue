<script setup lang="ts">
    import { computed } from 'vue';
    import type Card from '../models/Card';
    import { Suit, type SpellCard } from '../models/Card';

    const { card, selectedCard } = defineProps<{
        card: Card,
        selectedCard?: Card | null
    }>()

    const symbols = [
        '0', 'A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K',
    ]

    const animation = computed(() => card.animation);
    
    const isSpell = computed(() => card.isSpell);
    const spellCard = computed(() => isSpell.value ? card as SpellCard : null);
    
    const suitIconMap: Record<string, string> = {
        [Suit.Wood]: '/icons/tree-svgrepo-com.svg',
        [Suit.Fire]: '/icons/fire-svgrepo-com.svg',
        [Suit.Earth]: '/icons/rock-svgrepo-com.svg',
        [Suit.Metal]: '/icons/metal-bar-svgrepo-com.svg',
        [Suit.Water]: '/icons/water-drop-svgrepo-com.svg',
    };
    
    const suitIcon = computed(() => suitIconMap[card.suit] || '');
    
    const suitClass = computed(() => {
        if (card.suit === Suit.Wood) return 'suit-wood';
        if (card.suit === Suit.Fire) return 'suit-fire';
        if (card.suit === Suit.Water) return 'suit-water';
        if (card.suit === Suit.Earth) return 'suit-earth';
        if (card.suit === Suit.Metal) return 'suit-metal';
        return '';
    });
</script>

<template>
    <div class="card-view" :class="{ 
        selected: selectedCard === card,
        [card.animation]: !!animation,
    }">
        <img v-if="!card.revealed" class="card-back" src="/card_backs/koala.jpg" alt="Card Back" />
        <div v-else-if="isSpell && spellCard" class="card-front spell-card-front">
            <div class="card-top spell-card-top" :class="card.suit">
                <div class="spell-card-left">
                    <span class="spell-card-rank">{{ symbols[card.rank] || card.rank }}</span>
                    <img :src="suitIcon" :alt="card.suit" class="card-rank-icon" :class="suitClass" />
                </div>
                <span class="spell-card-name">{{ spellCard.name }}</span>
            </div>
            <p class="card-description spell-card-description">{{ spellCard.description }}</p>
        </div>
        <div v-else class="card-front playing-card">
            <div class="card-top spell-card-top" :class="card.suit">
                <div class="spell-card-left">
                    <span class="spell-card-rank">{{ symbols[card.rank] || card.rank }}</span>
                    <img :src="suitIcon" :alt="card.suit" class="card-rank-icon" :class="suitClass" />
                </div>
                <span class="spell-card-name"></span>
            </div>
            <div class="card-icons-center">
                <img 
                    v-for="index in card.rank" 
                    :key="index"
                    :src="suitIcon" 
                    :alt="card.suit"
                    class="card-icon"
                    :class="suitClass"
                />
            </div>
        </div>
    </div>
</template>
