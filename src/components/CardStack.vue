<script setup lang="ts">
    import CardView from './SingleCard.vue';
    import DummyCard from './DummyCard.vue';
    import Card from '../models/Card';
    import { AREAS, type Area } from '../models/Areas';
    import { toRaw, computed } from 'vue';
    import { Suits, Suit } from '../models/Card';
    
    const props = defineProps<{ 
        cards: Card[], 
        name: string, 
        layout?: string,
        selectedCard?: Card | null
        arrayIndex?: number
        highlighted?: boolean
        highlightType?: 'burn' | 'cast'
        customLabel?: string
    }>();

    const SELECTED_CARD_Z_INDEX = 1000;

    const HORIZONTAL_CARD_WIDTH = 100;
    const HORIZONTAL_MAX_STACK_WIDTH = 740;

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
        if (isSelected) {
            return { ...base, zIndex: SELECTED_CARD_Z_INDEX };
        }
        return base;
    }

    /** For horizontal layout, the width of the visible (clickable) strip so the card below can be clicked. */
    function clickableWidth(index: number): number | undefined {
        if (props.layout !== 'horizontal') return undefined;
        const numCards = props.cards.length;
        if (numCards <= 1) return undefined;
        const spacing = (HORIZONTAL_MAX_STACK_WIDTH - HORIZONTAL_CARD_WIDTH) / (numCards - 1);
        return index === numCards - 1 ? HORIZONTAL_CARD_WIDTH : spacing;
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
    
    const suitIconMap: Record<string, string> = {
        [Suit.Wood]: '/icons/tree-svgrepo-com.svg',
        [Suit.Fire]: '/icons/fire-svgrepo-com.svg',
        [Suit.Earth]: '/icons/rock-svgrepo-com.svg',
        [Suit.Metal]: '/icons/metal-bar-svgrepo-com.svg',
        [Suit.Water]: '/icons/water-drop-svgrepo-com.svg',
    };
    
    const manaPoolSuit = computed(() => {
        if (props.name === AREAS.ManaPools && props.arrayIndex !== undefined) {
            return Suits[props.arrayIndex];
        }
        return null;
    });
    
    const manaPoolIcon = computed(() => {
        const suit = manaPoolSuit.value;
        return suit ? suitIconMap[suit] || '' : '';
    });
    
    const manaPoolSuitClass = computed(() => {
        const suit = manaPoolSuit.value;
        if (!suit) return '';
        if (suit === Suit.Wood) return 'suit-wood';
        if (suit === Suit.Fire) return 'suit-fire';
        if (suit === Suit.Water) return 'suit-water';
        if (suit === Suit.Earth) return 'suit-earth';
        if (suit === Suit.Metal) return 'suit-metal';
        return '';
    });
</script>

<template>
    <div :class="['card-stack', layout || 'pile', { 'mana-pool-stack': name === AREAS.ManaPools }]">
        <template v-if="!cards.length">
            <DummyCard
                :label="customLabel || name"
                :mana-pool-icon="name === AREAS.ManaPools ? manaPoolIcon : undefined"
                :mana-pool-icon-alt="name === AREAS.ManaPools && manaPoolSuit ? String(manaPoolSuit) : undefined"
                :mana-pool-suit-class="name === AREAS.ManaPools ? manaPoolSuitClass : undefined"
                :highlighted="highlighted"
                :highlight-type="highlightType"
                @click="handleEmptyClick"
            />
        </template>
        <template v-else>
            <div v-if="name === AREAS.ManaPools && (layout === 'pile' || !layout)" class="mana-pool-pile-slot">
                <CardView
                    v-for="(card, index) in cards"
                    :key="index"
                    :card="card"
                    :clickableWidth="clickableWidth(index)"
                    :class="{
                        'castable-highlight': highlighted && index === cards.length - 1 && highlightType === 'cast',
                        'burnable-highlight': highlighted && index === cards.length - 1 && highlightType === 'burn'
                    }"
                    :style="!card.animation || card.animation === 'burn' || card.animation === 'move-to-mana' ? cardPosition(index, card) : {}"
                    :selectedCard="selectedCard"
                    @click.stop="handleClick(index)"
                />
            </div>
            <template v-else>
                <CardView
                    v-for="(card, index) in cards"
                    :key="index"
                    :card="card"
                    :clickableWidth="clickableWidth(index)"
                    :class="{
                        'castable-highlight': highlighted && (layout === 'vertical' || !layout || layout === 'pile') && index === cards.length - 1 && highlightType === 'cast',
                        'burnable-highlight': highlighted && (layout === 'vertical' || !layout || layout === 'pile') && index === cards.length - 1 && highlightType === 'burn'
                    }"
                    :style="!card.animation || card.animation === 'burn' || card.animation === 'move-to-mana' ? cardPosition(index, card) : {}"
                    :selectedCard="selectedCard"
                    @click.stop="handleClick(index)"
                />
            </template>
        </template>
    </div>
</template>
