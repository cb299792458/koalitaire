<script setup lang="ts">
    import CardView from './SingleCard.vue';
    import Card from '../models/Card';
    import { AREAS, type Area } from '../models/Areas';
    import { toRaw } from 'vue';
    import { suits } from '../composables/useGameState';
    
    const props = defineProps<{ 
        cards: Card[], 
        name: string, 
        layout?: string,
        selectedCard?: Card | null
        selectCard?: (card: Card | null) => void
        arrayIndex?: number
    }>();

    function cardPosition(index: number) {
        let spacing: number;
        switch (props.layout) {
            case 'vertical':
                spacing = 20;
                return {
                    position: 'absolute',
                    top: `${index * spacing}px`,
                    left: '0px',
                    zIndex: index + 1,
                };
            case 'horizontal':
                // TODO: fix for different screen sizes
                const cardWidth = 100;
                const maxStackWidth = 740;
                const numCards = props.cards.length;
                spacing = (maxStackWidth - cardWidth) / (numCards - 1);
                const stackWidth = spacing * (numCards - 1) + cardWidth;
                const left = (maxStackWidth - stackWidth) / 2 + index * spacing;

                return {
                    position: 'absolute',
                    top: '0px',
                    left: `${left}px`,
                    zIndex: index + 1,
                };
            case 'pile':
            default:
                return {
                    position: 'absolute',
                    top: `-${index * 0.25}px`,
                    left: `-${index * 0.25}px`,
                    zIndex: props.cards.length + index,
                };
        }
    }

    const emit = defineEmits<{
        (e: 'click', payload: {
            card: Card | null;
            area: Area;
            arrayIndex?: number;
            cardIndex: number;
        }): void;
    }>();

    function handleClick(cardIndex: number) {
        const card = props.cards[cardIndex]!;
        emit('click', {
            card: toRaw(card),
            area: props.name as Area,
            arrayIndex: props.arrayIndex,
            cardIndex,
        });
    }
    function handleEmptyClick() {
        const dummyCard = new Card(
            0,
            'None',
        );
        emit('click', {
            card: dummyCard,
            area: props.name as Area,
            arrayIndex: props.arrayIndex,
            cardIndex: -1,
        });
    }
</script>

<template>
    <div :class="`card-stack ${layout || 'pile'}`">
        <div
            class="card-stack-empty"
            v-if="!cards.length"
            @click.stop="handleEmptyClick"
        >
            {{ name === AREAS.ManaPools ? suits[arrayIndex || 0] : name }}
        </div>
        <template v-else>
            <CardView v-for="(card, index) in cards"
                :key="index" 
                :card="card"
                :style="cardPosition(index)"
                :selectedCard="selectedCard"
                @click.stop="handleClick(index)"
            />
        </template>
    </div>
</template>
