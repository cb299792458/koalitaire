<script setup lang="ts">
    import { computed, ref } from 'vue';
    import type Card from '../models/Card';
    import { Suit, type SpellCard } from '../models/Card';
    import { getKeywordExplanation } from '../game/keywords';

    const { card, selectedCard, clickableWidth } = defineProps<{
        card: Card,
        selectedCard?: Card | null,
        /** When set (e.g. horizontal hand), only this-width strip is clickable so cards below can be clicked. */
        clickableWidth?: number
    }>()

    const tooltipX = ref(0);
    const tooltipY = ref(0);
    const showTooltip = ref(false);
    let showDelay: ReturnType<typeof setTimeout> | null = null;

    function onMouseMove(e: MouseEvent) {
        tooltipX.value = e.clientX;
        tooltipY.value = e.clientY;
    }

    function onMouseEnter(e: MouseEvent) {
        onMouseMove(e);
        showDelay = setTimeout(() => {
            showTooltip.value = true;
            showDelay = null;
        }, 800);
    }

    function onMouseLeave() {
        if (showDelay !== null) {
            clearTimeout(showDelay);
            showDelay = null;
        }
        showTooltip.value = false;
    }

    const symbols = [
        '0', 'A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K',
    ]

    const animation = computed(() => card?.animation);
    
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

    const tooltipTitle = computed(() => {
        if (isSpell.value && spellCard.value) {
            return spellCard.value.name;
        }
        return 'Mana Card';
    });

    const keywordExplanations = computed(() => {
        const kw = card.keywords ?? [];
        return kw.map((id) => ({ id, text: getKeywordExplanation(id) }));
    });
</script>

<template>
    <div
        class="card-view-wrapper"
        :class="{ 'card-view-wrapper--hit-area': clickableWidth != null }"
        @mousemove="clickableWidth == null ? onMouseMove($event) : undefined"
        @mouseenter="clickableWidth == null ? onMouseEnter($event) : undefined"
        @mouseleave="clickableWidth == null ? onMouseLeave() : undefined"
    >
        <Teleport to="body">
            <div
                class="card-tooltip"
                :class="{ 'card-tooltip--visible': showTooltip }"
                :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
            >
                <div class="card-tooltip-title">{{ tooltipTitle }}</div>
                <template v-if="keywordExplanations.length">
                    <div v-for="item in keywordExplanations" :key="item.id" class="card-tooltip-keyword">
                        {{ item.text }}
                    </div>
                </template>
                <div v-if="card.flavorText" class="card-tooltip-flavor">{{ card.flavorText }}</div>
            </div>
        </Teleport>
        <div
            class="card-view"
            :class="{
                selected: selectedCard === card,
                [card?.animation]: !!animation,
                'card-view--no-pointer': clickableWidth != null
            }"
        >
        <img v-if="!card.revealed" class="card-back" src="/card_backs/koala.jpg" alt="Card Back" />
        <div v-else-if="isSpell && spellCard" class="card-front spell-card-front">
            <div class="card-top spell-card-top" :class="card.suit">
                <div class="spell-card-left">
                    <span class="spell-card-rank">{{ symbols[card.rank] || card.rank }}</span>
                    <img :src="suitIcon" :alt="card.suit" class="card-rank-icon" :class="suitClass" />
                </div>
                <span class="spell-card-name">{{ spellCard.name }}</span>
            </div>
            <p v-if="Number.isFinite(spellCard.charges)" class="spell-card-charges">{{ spellCard.charges }} {{ spellCard.charges === 1 ? 'charge' : 'charges' }}</p>
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
            <div class="card-icons-center" :class="'rank-' + card.rank">
                <div v-if="card.rank === 5 || card.rank === 6" class="card-icons-inner">
                    <img
                        v-for="index in card.rank"
                        :key="index"
                        :src="suitIcon"
                        :alt="card.suit"
                        class="card-icon"
                        :class="suitClass"
                    />
                </div>
                <template v-else>
                    <img
                        v-for="index in card.rank"
                        :key="index"
                        :src="suitIcon"
                        :alt="card.suit"
                        class="card-icon"
                        :class="suitClass"
                    />
                </template>
            </div>
        </div>
        <div
            v-if="clickableWidth != null"
            class="card-hit-area"
            :style="{ width: clickableWidth + 'px' }"
            @mousemove="onMouseMove"
            @mouseenter="onMouseEnter"
            @mouseleave="onMouseLeave"
        />
        </div>
    </div>
</template>

<style scoped>
.card-view-wrapper {
    position: relative;
    display: inline-block;
}

.card-view-wrapper--hit-area {
    pointer-events: none;
}

.card-view-wrapper--hit-area .card-hit-area {
    pointer-events: auto;
}

.card-view--no-pointer {
    pointer-events: none;
}

.card-hit-area {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 1;
}

.card-tooltip {
    position: fixed;
    padding: 10px 14px;
    min-width: 280px;
    max-width: 380px;
    background: rgba(0, 0, 0, 0.9);
    color: #fff;
    font-size: 12px;
    line-height: 1.4;
    border-radius: 6px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 2000;
}

.card-tooltip--visible {
    opacity: 1;
}

.card-tooltip-title {
    font-weight: 600;
    margin-bottom: 4px;
}

.card-tooltip-keyword {
    margin-top: 4px;
    padding-left: 8px;
    border-left: 2px solid rgba(255, 255, 255, 0.4);
}

.card-tooltip-flavor {
    margin-top: 8px;
    font-style: italic;
    color: rgba(255, 255, 255, 0.85);
}

</style>
