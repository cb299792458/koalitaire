<script setup lang="ts">
import CardView from './SingleCard.vue';
import DummyCard from './DummyCard.vue';
import Card from '../../models/Card';
import { AREAS, type Area } from '../../models/Areas';
import { toRaw, computed } from 'vue';
import { Suits } from '../../models/Suit';
import { suitIconMap, suitClassMap } from '../../utils/suitAssets';

const props = defineProps<{
    cards: Card[];
    name: string;
    layout?: string;
    selectedCard?: Card | null;
    arrayIndex?: number;
    highlighted?: boolean;
    highlightType?: 'burn' | 'cast';
    customLabel?: string;
}>();

const SELECTED_CARD_Z_INDEX = 1000;
const HORIZONTAL_CARD_WIDTH = 100;
const HORIZONTAL_MAX_STACK_WIDTH = 740;

const ANIMATIONS_WITH_POSITION = new Set(['burn', 'move-to-mana', 'tableau-move']);

const manaPoolSuit = computed(() => {
    if (props.name === AREAS.ManaPools && props.arrayIndex !== undefined) {
        return Suits[props.arrayIndex];
    }
    return null;
});

const manaPoolIcon = computed(() =>
    manaPoolSuit.value ? suitIconMap[manaPoolSuit.value] ?? '' : ''
);

const manaPoolSuitClass = computed(() =>
    manaPoolSuit.value ? suitClassMap[manaPoolSuit.value] ?? '' : ''
);

const isManaPoolPile = computed(
    () => props.name === AREAS.ManaPools && (props.layout === 'pile' || !props.layout)
);

function shouldShowHighlight(index: number): boolean {
    if (!props.highlighted || index !== props.cards.length - 1) return false;
    if (props.name === AREAS.ManaPools) return true;
    return props.layout === 'vertical' || !props.layout || props.layout === 'pile';
}

function usesPositionStyle(card: Card): boolean {
    return !card.animation || ANIMATIONS_WITH_POSITION.has(card.animation);
}

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
        case 'horizontal': {
            const numCards = props.cards.length;
            if (numCards <= 1) {
                base = {
                    position: 'absolute',
                    top: '0px',
                    left: `${(HORIZONTAL_MAX_STACK_WIDTH - HORIZONTAL_CARD_WIDTH) / 2}px`,
                    zIndex: index + 1,
                };
            } else {
                spacing = (HORIZONTAL_MAX_STACK_WIDTH - HORIZONTAL_CARD_WIDTH) / (numCards - 1);
                const stackWidth = spacing * (numCards - 1) + HORIZONTAL_CARD_WIDTH;
                const left = (HORIZONTAL_MAX_STACK_WIDTH - stackWidth) / 2 + index * spacing;
                base = {
                    position: 'absolute',
                    top: '0px',
                    left: `${left}px`,
                    zIndex: index + 1,
                };
            }
            break;
        }
        case 'pile':
        default:
            base = {
                position: 'absolute',
                top: `-${index * 0.25}px`,
                left: `-${index * 0.25}px`,
                zIndex: props.cards.length + index,
            };
            break;
    }
    return isSelected ? { ...base, zIndex: SELECTED_CARD_Z_INDEX } : base;
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
</script>

<template>
    <div :class="['card-stack', layout || 'pile', { 'mana-pool-stack': name === AREAS.ManaPools }]">
        <DummyCard
            v-if="!cards.length"
            :label="customLabel || name"
            :mana-pool-icon="name === AREAS.ManaPools ? manaPoolIcon : undefined"
            :mana-pool-icon-alt="name === AREAS.ManaPools && manaPoolSuit ? String(manaPoolSuit) : undefined"
            :mana-pool-suit-class="name === AREAS.ManaPools ? manaPoolSuitClass : undefined"
            :highlighted="highlighted"
            :highlight-type="highlightType"
            @click="handleEmptyClick"
        />
        <div v-else :class="{ 'mana-pool-pile-slot': isManaPoolPile }">
            <CardView
                v-for="(card, index) in cards"
                :key="index"
                :card="card"
                :class="{
                    'castable-highlight': shouldShowHighlight(index) && highlightType === 'cast',
                    'burnable-highlight': shouldShowHighlight(index) && highlightType === 'burn',
                }"
                :style="usesPositionStyle(card) ? cardPosition(index, card) : {}"
                :selectedCard="selectedCard"
                @click.stop="handleClick(index)"
            />
        </div>
    </div>
</template>

<style scoped>
.card-stack {
    position: relative;
}

.card-stack.horizontal {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

.card-stack.horizontal :deep(.card-view) {
    align-self: flex-start;
}

.card-stack.pile {
    position: relative;
    width: 100%;
    height: auto;
    min-height: 168px;
}

.card-stack.vertical {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
}

.card-stack-label {
    position: absolute;
    top: -25px;
    left: 0;
    right: 0;
    text-align: center;
    font-weight: bold;
    color: #00ff00;
    z-index: 1000;
    pointer-events: none;
}

.card-stack-empty.burnable-highlight,
:deep(.card-view.burnable-highlight) {
    box-shadow: 0 0 12px red;
    transition: border 0.2s, box-shadow 0.2s;
}

.card-stack-empty.castable-highlight,
:deep(.card-view.castable-highlight) {
    box-shadow: 0 0 12px #00aaff;
    transition: border 0.2s, box-shadow 0.2s;
}
</style>
