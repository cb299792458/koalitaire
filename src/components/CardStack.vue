<script setup lang="ts">
    import CardView from './SingleCard.vue';
    import Card from '../models/Card';
    import { AREAS, type Area } from '../models/Areas';
    import { toRaw } from 'vue';
    import { Suits } from '../models/Card';
    
    const props = defineProps<{ 
        cards: Card[], 
        name: string, 
        layout?: string,
        selectedCard?: Card | null
        arrayIndex?: number
        highlighted?: boolean
        customLabel?: string
        alwaysShowDummy?: boolean
    }>();

    const SELECTED_CARD_Z_INDEX = 1000;

    function cardPosition(index: number, card: Card) {
        const isSelected = props.selectedCard === card;
        let base: { position: string; top: string; left: string; zIndex: number };
        let spacing: number;
        switch (props.layout) {
            case 'vertical':
                spacing = 20;
                base = {
                    position: 'absolute',
                    top: `${index * spacing}px`,
                    left: '0px',
                    zIndex: index + 1,
                };
                break;
            case 'horizontal':
                // TODO: fix for different screen sizes
                const cardWidth = 100;
                const maxStackWidth = 740;
                const numCards = props.cards.length;
                if (numCards <= 1) {
                    base = {
                        position: 'absolute',
                        top: '0px',
                        left: `${(maxStackWidth - cardWidth) / 2}px`,
                        zIndex: index + 1,
                    };
                } else {
                    spacing = (maxStackWidth - cardWidth) / (numCards - 1);
                    const stackWidth = spacing * (numCards - 1) + cardWidth;
                    const left = (maxStackWidth - stackWidth) / 2 + index * spacing;
                    base = {
                        position: 'absolute',
                        top: '0px',
                        left: `${left}px`,
                        zIndex: index + 1,
                    };
                }
                break;
            case 'pile':
            default:
                base = {
                    position: 'absolute',
                    top: `-${index * 0.25}px`,
                    left: `-${index * 0.25}px`,
                    zIndex: props.cards.length + index,
                };
        }
        if (isSelected) {
            return { ...base, zIndex: SELECTED_CARD_Z_INDEX };
        }
        return base;
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
        emit('click', {
            card: null,
            area: props.name as Area,
            arrayIndex: props.arrayIndex,
            cardIndex: -1,
        });
    }

    function dummyPosition() {
        if (props.layout === 'pile' || !props.layout) {
            // Position dummy at the bottom of the pile (behind all cards)
            return {
                position: 'absolute' as const,
                top: '0px',
                left: '0px',
                zIndex: 0,
            };
        }
        return {};
    }
</script>

<template>
    <div :class="['card-stack', layout || 'pile']">
        <template v-if="alwaysShowDummy">
            <div v-if="customLabel" class="card-stack-label">{{ customLabel }}</div>
            <div
                class="card-stack-empty"
                :class="{ 'castable-highlight': highlighted }"
                :style="dummyPosition()"
                @click.stop="handleEmptyClick"
            >
                {{ customLabel || (name === AREAS.ManaPools ? Suits[arrayIndex ?? 0] : name) }}
            </div>
            <CardView v-for="(card, index) in cards"
                :key="index" 
                :card="card"
                :style="!card.animation || card.animation === 'burn' ? cardPosition(index, card) : {}"
                :selectedCard="selectedCard"
                @click.stop="handleClick(index)"
            />
        </template>
        <template v-else>
            <div
                class="card-stack-empty"
                :class="{ 'castable-highlight': highlighted && !cards.length }"
                v-if="!cards.length"
                @click.stop="handleEmptyClick"
            >
                {{ customLabel || (name === AREAS.ManaPools ? Suits[arrayIndex ?? 0] : name) }}
            </div>
            <template v-else>
                <div v-if="customLabel" class="card-stack-label">{{ customLabel }}</div>
                <CardView v-for="(card, index) in cards"
                    :key="index" 
                    :card="card"
                    :class="{ 'castable-highlight': highlighted && ((layout === 'vertical' || !layout || layout === 'pile') && index === cards.length - 1) }"
                    :style="!card.animation || card.animation === 'burn' ? cardPosition(index, card) : {}"
                    :selectedCard="selectedCard"
                    @click.stop="handleClick(index)"
                />
            </template>
        </template>
    </div>
</template>
