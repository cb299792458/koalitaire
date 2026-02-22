<script setup lang="ts">
    import { computed, ref, watch } from 'vue';
    import type Card from '../models/Card';
    import { Suit, type SpellCard } from '../models/Card';
    import { getKeywordExplanation } from '../game/keywords';

    const { card, selectedCard } = defineProps<{
        card: Card,
        selectedCard?: Card | null
    }>()

    const tooltipX = ref(0);
    const tooltipY = ref(0);
    const showTooltip = ref(false);
    const tooltipRef = ref<HTMLElement | null>(null);
    let showDelay: ReturnType<typeof setTimeout> | null = null;

    const TOOLTIP_OFFSET = 12;
    const TOOLTIP_EDGE_PADDING = 20;

    const tooltipStyle = computed(() => {
        const x = tooltipX.value;
        const y = tooltipY.value;
        const height = tooltipRef.value?.offsetHeight ?? 450;
        const wouldOverflowBottom = y + TOOLTIP_OFFSET + height > window.innerHeight - TOOLTIP_EDGE_PADDING;
        return {
            left: x + TOOLTIP_OFFSET + 'px',
            top: wouldOverflowBottom ? (y - height - TOOLTIP_EDGE_PADDING) + 'px' : (y + TOOLTIP_OFFSET) + 'px',
        };
    });

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
        [Suit.Koala]: '/icons/koala.svg',
    };
    
    const suitIcon = computed(() => suitIconMap[card.suit] || '');
    
    const suitClass = computed(() => {
        if (card.suit === Suit.Wood) return 'suit-wood';
        if (card.suit === Suit.Fire) return 'suit-fire';
        if (card.suit === Suit.Water) return 'suit-water';
        if (card.suit === Suit.Earth) return 'suit-earth';
        if (card.suit === Suit.Metal) return 'suit-metal';
        if (card.suit === Suit.Koala) return 'suit-koala';
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

    const cardArtworkName = computed(() => {
        if (isSpell.value && spellCard.value) return spellCard.value.name;
        return '';
    });

    const artworkBasePath = computed(() => {
        const name = String(cardArtworkName.value).replace(/\s+/g, '_');
        return `/cards/${name}`;
    });

    const artworkBasePathWithSpaces = computed(() => {
        const name = String(cardArtworkName.value);
        return `/cards/${encodeURIComponent(name)}`;
    });

    const artworkSrc = ref<string | null>(null);
    const artworkVisible = ref(false);

    const artworkFallbacks = computed(() => {
        const base = [
            `${artworkBasePath.value}.png`,
            `${artworkBasePath.value}.jpg`,
            `${artworkBasePathWithSpaces.value}.png`,
            `${artworkBasePathWithSpaces.value}.jpg`,
        ];
        // Deduplicate: single-word names (Thunderstruck, Koallaborator) produce identical base + withSpaces paths
        const unique = [...new Set([...base, '/cards/default.png', '/cards/default.jpg', '/unknown.jpg'])];
        return unique;
    });

    function resetArtwork() {
        artworkSrc.value = artworkFallbacks.value[0] ?? null;
        artworkVisible.value = true;
    }

    function onArtworkError() {
        const fallbacks = artworkFallbacks.value;
        const currentIdx = fallbacks.findIndex((url) => artworkSrc.value === url);
        if (currentIdx >= 0 && currentIdx < fallbacks.length - 1) {
            artworkSrc.value = fallbacks[currentIdx + 1]!;
        } else {
            artworkSrc.value = '/unknown.jpg';
        }
    }

    function onArtworkLoad() {
        artworkVisible.value = true;
    }

    watch(() => card, () => {
        if (isSpell.value) resetArtwork();
        else artworkVisible.value = false;
    }, { immediate: true });
</script>

<template>
    <div
        class="card-view"
        :class="{
            selected: selectedCard === card,
            [card?.animation]: !!animation
        }"
        @mousemove="onMouseMove"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
    >
        <Teleport to="body">
            <div
                ref="tooltipRef"
                class="card-tooltip"
                :class="{ 'card-tooltip--visible': showTooltip }"
                :style="tooltipStyle"
            >
                <div class="card-tooltip-preview-wrapper">
                    <div class="card-tooltip-preview-inner card-view">
                        <img v-if="!card.revealed" class="card-back" src="/card_backs/koala.jpg" alt="Card Back" />
                        <div v-else-if="isSpell && spellCard" class="card-front spell-card-front">
                            <div class="card-top spell-card-top" :class="card.suit">
                                <div class="spell-card-left">
                                    <span class="spell-card-rank">{{ symbols[card.rank] || card.rank }}</span>
                                    <img :src="suitIcon" :alt="card.suit" class="card-rank-icon" :class="suitClass" />
                                </div>
                                <span class="spell-card-name">{{ spellCard.name }}</span>
                            </div>
                            <div v-if="artworkVisible && artworkSrc" class="card-artwork-container">
                                <img :src="artworkSrc" :alt="spellCard.name" class="card-artwork" />
                            </div>
                            <div class="spell-card-bottom">
                                <p class="card-description spell-card-description">{{ spellCard.description }}</p>
                                <p v-if="Number.isFinite(spellCard.charges)" class="spell-card-charges">{{ spellCard.charges }} {{ spellCard.charges === 1 ? 'charge' : 'charges' }}</p>
                            </div>
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
                                    <img v-for="index in card.rank" :key="index" :src="suitIcon" :alt="card.suit" class="card-icon" :class="suitClass" />
                                </div>
                                <template v-else>
                                    <img v-for="index in card.rank" :key="index" :src="suitIcon" :alt="card.suit" class="card-icon" :class="suitClass" />
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-tooltip-title">{{ tooltipTitle }}</div>
                <template v-if="keywordExplanations.length">
                    <div v-for="item in keywordExplanations" :key="item.id" class="card-tooltip-keyword">
                        {{ item.text }}
                    </div>
                </template>
                <div v-if="card.flavorText" class="card-tooltip-flavor">{{ card.flavorText }}</div>
            </div>
        </Teleport>
        <img v-if="!card.revealed" class="card-back" src="/card_backs/koala.jpg" alt="Card Back" />
        <div v-else-if="isSpell && spellCard" class="card-front spell-card-front">
            <div class="card-top spell-card-top" :class="card.suit">
                <div class="spell-card-left">
                    <span class="spell-card-rank">{{ symbols[card.rank] || card.rank }}</span>
                    <img :src="suitIcon" :alt="card.suit" class="card-rank-icon" :class="suitClass" />
                </div>
                <span class="spell-card-name">{{ spellCard.name }}</span>
            </div>
            <div v-if="artworkVisible && artworkSrc" class="card-artwork-container">
                <img
                    :src="artworkSrc"
                    :alt="spellCard.name"
                    class="card-artwork"
                    @error="onArtworkError"
                    @load="onArtworkLoad"
                />
            </div>
            <div class="spell-card-bottom">
                <p class="card-description spell-card-description">{{ spellCard.description }}</p>
                <p v-if="Number.isFinite(spellCard.charges)" class="spell-card-charges">{{ spellCard.charges }} {{ spellCard.charges === 1 ? 'charge' : 'charges' }}</p>
            </div>
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
    </div>
</template>

<style scoped>
.card-view {
    position: relative;
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

.card-tooltip-preview-wrapper {
    width: 240px;
    height: 336px;
    margin-bottom: 10px;
    flex-shrink: 0;
}

.card-tooltip-preview-inner {
    width: 120px;
    aspect-ratio: 5 / 7;
    transform: scale(2);
    transform-origin: top left;
    background-color: #f5f0d0;
    border-radius: 10px;
    border: 1px solid black;
    overflow: hidden;
    color: black;
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

.card-artwork-container {
    flex: 1 1 0;
    min-height: 0;
    max-height: 50%;
    margin: 2px 3px;
    overflow: hidden;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.08);
}

.card-artwork {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

</style>
