<script setup lang="ts">
    import { computed, ref, watch } from 'vue';
    import type Card from '../../models/Card';
    import { type SpellCard } from '../../models/Card';
    import { getKeywordExplanation } from '../../game/keywords';
    import { suitIconMap, suitClassMap } from '../../utils/suitAssets';
    import { formatStatSymbols } from '../../utils/damageSymbol';

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

    const hasSuit = computed(() => card.suit !== null);
    const suitIcon = computed(() =>
        hasSuit.value && card.suit != null ? suitIconMap[card.suit] ?? '' : ''
    );
    const suitClass = computed(() =>
        hasSuit.value && card.suit != null ? suitClassMap[card.suit] ?? '' : ''
    );
    const suitTopClass = computed(() => (hasSuit.value && card.suit != null ? card.suit : 'card-suit-none'));

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
        class="card-view clickable"
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
                            <div class="card-top spell-card-top" :class="suitTopClass">
                                <div class="spell-card-left">
                                    <span class="spell-card-rank">{{ symbols[card.rank] || card.rank }}</span>
                                    <img
                                        v-if="hasSuit"
                                        :src="suitIcon"
                                        :alt="String(card.suit)"
                                        class="card-rank-icon"
                                        :class="suitClass"
                                    />
                                </div>
                                <span class="spell-card-name">{{ spellCard.name }}</span>
                            </div>
                            <div v-if="artworkVisible && artworkSrc" class="card-artwork-container">
                                <img :src="artworkSrc" :alt="spellCard.name" class="card-artwork" />
                            </div>
                            <div class="spell-card-bottom">
                                <p class="card-description spell-card-description" v-html="formatStatSymbols(spellCard.description)"></p>
                                <p v-if="Number.isFinite(spellCard.charges)" class="spell-card-charges">{{ spellCard.charges }} {{ spellCard.charges === 1 ? 'charge' : 'charges' }}</p>
                            </div>
                        </div>
                        <div v-else class="card-front playing-card">
                            <div class="card-top spell-card-top" :class="suitTopClass">
                                <div class="spell-card-left">
                                    <span class="spell-card-rank">{{ symbols[card.rank] || card.rank }}</span>
                                    <img
                                        v-if="hasSuit"
                                        :src="suitIcon"
                                        :alt="String(card.suit)"
                                        class="card-rank-icon"
                                        :class="suitClass"
                                    />
                                </div>
                                <span class="spell-card-name"></span>
                            </div>
                            <div
                                v-if="hasSuit"
                                class="card-icons-center"
                                :class="'rank-' + card.rank"
                            >
                                <div v-if="card.rank >= 5 && card.rank <= 9" class="card-icons-inner">
                                    <img
                                        v-for="index in card.rank"
                                        :key="index"
                                        :src="suitIcon"
                                        :alt="String(card.suit)"
                                        class="card-icon"
                                        :class="suitClass"
                                    />
                                </div>
                                <template v-else>
                                    <img
                                        v-for="index in card.rank"
                                        :key="index"
                                        :src="suitIcon"
                                        :alt="String(card.suit)"
                                        class="card-icon"
                                        :class="suitClass"
                                    />
                                </template>
                            </div>
                            <div v-else class="card-icons-center card-icons-center--no-suit">
                                <span class="card-no-suit-rank">{{ symbols[card.rank] || card.rank }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-tooltip-title">{{ tooltipTitle }}</div>
                <template v-if="keywordExplanations.length">
                    <div v-for="item in keywordExplanations" :key="item.id" class="card-tooltip-keyword" v-html="formatStatSymbols(item.text)"></div>
                </template>
                <div v-if="card.flavorText" class="card-tooltip-flavor">{{ card.flavorText }}</div>
            </div>
        </Teleport>
        <img v-if="!card.revealed" class="card-back" src="/card_backs/koala.jpg" alt="Card Back" />
        <div v-else-if="isSpell && spellCard" class="card-front spell-card-front">
            <div class="card-top spell-card-top" :class="suitTopClass">
                <div class="spell-card-left">
                    <span class="spell-card-rank">{{ symbols[card.rank] || card.rank }}</span>
                    <img
                        v-if="hasSuit"
                        :src="suitIcon"
                        :alt="String(card.suit)"
                        class="card-rank-icon"
                        :class="suitClass"
                    />
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
                <p class="card-description spell-card-description" v-html="formatStatSymbols(spellCard.description)"></p>
                <p v-if="Number.isFinite(spellCard.charges)" class="spell-card-charges">{{ spellCard.charges }} {{ spellCard.charges === 1 ? 'charge' : 'charges' }}</p>
            </div>
        </div>
        <div v-else class="card-front playing-card">
            <div class="card-top spell-card-top" :class="suitTopClass">
                <div class="spell-card-left">
                    <span class="spell-card-rank">{{ symbols[card.rank] || card.rank }}</span>
                    <img
                        v-if="hasSuit"
                        :src="suitIcon"
                        :alt="String(card.suit)"
                        class="card-rank-icon"
                        :class="suitClass"
                    />
                </div>
                <span class="spell-card-name"></span>
            </div>
            <div
                v-if="hasSuit"
                class="card-icons-center"
                :class="'rank-' + card.rank"
            >
                <div v-if="card.rank >= 5 && card.rank <= 9" class="card-icons-inner">
                    <img
                        v-for="index in card.rank"
                        :key="index"
                        :src="suitIcon"
                        :alt="String(card.suit)"
                        class="card-icon"
                        :class="suitClass"
                    />
                </div>
                <template v-else>
                    <img
                        v-for="index in card.rank"
                        :key="index"
                        :src="suitIcon"
                        :alt="String(card.suit)"
                        class="card-icon"
                        :class="suitClass"
                    />
                </template>
            </div>
            <div v-else class="card-icons-center card-icons-center--no-suit">
                <span class="card-no-suit-rank">{{ symbols[card.rank] || card.rank }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card-view {
    position: relative;
    width: 120px;
    aspect-ratio: 5 / 7;
    background-color: #f5f0d0;
    opacity: 1;
    margin: 10px;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    border-radius: 10px;
    border: 1px solid black;
    overflow: hidden;
    box-sizing: border-box;
    font-size: 12px;
    color: black;
}

.card-view.start-animation {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(1.5);
    z-index: 999;
    transition: none;
    opacity: 1;
}

.card-view.fly-right,
.card-view.fly-left,
.card-view.fly-up {
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 999;
    opacity: 0;
    transition: transform 2s ease, opacity 2s ease;
}

.card-view.fly-right {
    transform: translate(100vw, -50%) scale(2) rotate(180deg);
}

.card-view.fly-left {
    transform: translate(-100vw, -50%) scale(2) rotate(-180deg);
}

.card-view.fly-up {
    transform: translate(-50%, -100vh) scale(2) rotate(1800deg);
}

.card-view.burn {
    transform: scale(0.8);
    transition: transform 1.2s ease, opacity 1.2s ease, box-shadow 0s ease;
    animation: burn-flicker 1.2s ease forwards;
    opacity: 0;
    box-shadow:
        0 0 20px orange,
        0 0 40px orange,
        0 0 60px yellow,
        0 0 80px red,
        0 0 100px orange;
    z-index: 999;
}

.card-view.tableau-move {
    animation: tableau-move-pulse 0.4s ease;
    z-index: 1000;
    transition: transform 0.4s ease;
}

.card-view.move-to-mana {
    animation: move-to-mana-pulse 0.22s ease;
    z-index: 1000;
    transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.card-view.draw {
    animation: draw-flip 0.5s ease;
    z-index: 1000;
}

.card-view.selected {
    box-shadow: 0 0 20px purple;
    transform: scale(1.05);
    transition: border 0.2s, transform 0.2s, box-shadow 0.2s;
    z-index: 1000;
}

@keyframes burn-flicker {
    0%, 100% { transform: scale(1.2) rotate(-10deg); }
    50% { transform: scale(1.3) rotate(10deg); }
}

@keyframes tableau-move-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

@keyframes move-to-mana-pulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 0 transparent; }
    50% { transform: scale(1.08); box-shadow: 0 0 12px rgba(0, 170, 255, 0.6); }
}

@keyframes draw-flip {
    0% {
        transform: rotateY(180deg) scale(0.8);
        opacity: 0;
    }
    50% {
        transform: rotateY(90deg) scale(1.1);
    }
    100% {
        transform: rotateY(0deg) scale(1);
        opacity: 1;
    }
}

.card-front {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
}

.spell-card-front {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    padding: 2px;
    padding-bottom: 36px;
    box-sizing: border-box;
}

.spell-card-top {
    flex-shrink: 0;
}

.spell-card-bottom {
    position: absolute;
    bottom: 5px;
    left: 5px;
    right: 5px;
    margin: 0;
}

.spell-card-description {
    margin: 0 0 2px 0;
    color: black;
    font-weight: bold;
    font-size: 10px;
}

.spell-card-charges {
    margin: 0;
    font-size: 11px;
    color: black;
    font-weight: bold;
}

.card-front.playing-card {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    padding: 2px;
    box-sizing: border-box;
}

.card-rank-top {
    font-size: 14px;
    font-weight: bold;
    text-align: left;
    line-height: 1;
    align-self: flex-start;
    justify-self: flex-start;
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 3px;
    padding: 0;
    position: absolute;
    top: 0;
    left: 0;
}

.card-rank-icon {
    width: 16px;
    height: 16px;
    object-fit: contain;
    display: inline-block;
    vertical-align: middle;
}

.card-rank-bottom {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    line-height: 1;
    transform: rotate(180deg);
}

.card-icons-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    flex-grow: 1;
    flex-shrink: 0;
}

.card-icons-center--no-suit {
    flex-grow: 1;
    justify-content: center;
}

.card-no-suit-rank {
    font-size: 28px;
    font-weight: bold;
    line-height: 1;
}

.spell-card-top.card-suit-none {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.card-icons-center.rank-2,
.card-icons-center.rank-3 {
    gap: 14px;
}

.card-icons-center.rank-4 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    place-items: center;
}

.card-icons-center.rank-5 {
    display: flex;
    justify-content: center;
    align-items: center;
}

.card-icons-center.rank-5 .card-icons-inner {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    gap: 10px;
    place-items: center;
    width: 100px;
    height: 100px;
}

.card-icons-center.rank-5 .card-icons-inner .card-icon:nth-child(1) { grid-column: 1; grid-row: 1; }
.card-icons-center.rank-5 .card-icons-inner .card-icon:nth-child(2) { grid-column: 3; grid-row: 1; }
.card-icons-center.rank-5 .card-icons-inner .card-icon:nth-child(3) { grid-column: 2; grid-row: 2; }
.card-icons-center.rank-5 .card-icons-inner .card-icon:nth-child(4) { grid-column: 1; grid-row: 3; }
.card-icons-center.rank-5 .card-icons-inner .card-icon:nth-child(5) { grid-column: 3; grid-row: 3; }

.card-icons-center.rank-6 {
    display: flex;
    justify-content: center;
    align-items: center;
}

.card-icons-center.rank-6 .card-icons-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    gap: 10px;
    place-items: center;
    width: 72px;
    height: 108px;
}

/* Ranks 7–9: playing-card style pip grids (not a single column). */
.card-icons-center.rank-7 {
    display: flex;
    justify-content: center;
    align-items: center;
}

.card-icons-center.rank-7 .card-icons-inner {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, auto);
    gap: 5px;
    place-items: center;
    width: 88px;
    height: 112px;
}

.card-icons-center.rank-7 .card-icons-inner .card-icon:nth-child(1) {
    grid-column: 1;
    grid-row: 1;
}
.card-icons-center.rank-7 .card-icons-inner .card-icon:nth-child(2) {
    grid-column: 3;
    grid-row: 1;
}
.card-icons-center.rank-7 .card-icons-inner .card-icon:nth-child(3) {
    grid-column: 2;
    grid-row: 2;
}
.card-icons-center.rank-7 .card-icons-inner .card-icon:nth-child(4) {
    grid-column: 1;
    grid-row: 3;
}
.card-icons-center.rank-7 .card-icons-inner .card-icon:nth-child(5) {
    grid-column: 3;
    grid-row: 3;
}
.card-icons-center.rank-7 .card-icons-inner .card-icon:nth-child(6) {
    grid-column: 1;
    grid-row: 4;
}
.card-icons-center.rank-7 .card-icons-inner .card-icon:nth-child(7) {
    grid-column: 3;
    grid-row: 4;
}

.card-icons-center.rank-8 {
    display: flex;
    justify-content: center;
    align-items: center;
}

.card-icons-center.rank-8 .card-icons-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: repeat(4, 1fr);
    gap: 7px;
    place-items: center;
    width: 72px;
    height: 112px;
}

.card-icons-center.rank-9 {
    display: flex;
    justify-content: center;
    align-items: center;
}

.card-icons-center.rank-9 .card-icons-inner {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 5px;
    place-items: center;
    width: 88px;
    height: 88px;
}

.card-icon {
    width: 24px;
    height: 24px;
    object-fit: contain;
}

.card-rank-icon.suit-wood,
.card-icon.suit-wood { filter: brightness(0) saturate(100%) invert(25%) sepia(100%) saturate(2000%) hue-rotate(90deg) brightness(70%) contrast(120%); }
.card-rank-icon.suit-fire,
.card-icon.suit-fire { filter: brightness(0) saturate(100%) invert(16%) sepia(94%) saturate(7151%) hue-rotate(358deg) brightness(99%) contrast(113%); }
.card-rank-icon.suit-water,
.card-icon.suit-water { filter: brightness(0) saturate(100%) invert(48%) sepia(99%) saturate(2476%) hue-rotate(182deg) brightness(95%) contrast(86%); }
.card-rank-icon.suit-metal,
.card-icon.suit-metal { filter: brightness(0) saturate(0%) invert(50%) grayscale(100%); }
.card-rank-icon.suit-earth,
.card-icon.suit-earth { filter: brightness(0) saturate(100%) invert(30%) sepia(100%) saturate(1200%) hue-rotate(30deg) brightness(70%) contrast(110%); }
.card-rank-icon.suit-koala,
.card-icon.suit-koala { filter: brightness(0) saturate(100%) invert(20%) sepia(40%) saturate(800%) hue-rotate(25deg) brightness(60%) contrast(100%); }

.card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 5px;
    width: calc(100% - 10px);
    box-sizing: border-box;
}

.spell-card-top {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    width: calc(100% - 6px);
    max-width: calc(100% - 6px);
    gap: 2px;
    min-width: 0;
    box-sizing: border-box;
    overflow: hidden;
    margin: 0 3px;
}

.spell-card-left {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}

.spell-card-rank {
    /* Monospace so each rank glyph (A, 2–6, T, J, …) shares one column width; proportional 1ch was narrower than bold A and clipped under .spell-card-top overflow:hidden */
    font-family: ui-monospace, 'Cascadia Mono', 'Consolas', 'Segoe UI Mono', monospace;
    font-weight: bold;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1ch;
    min-width: 1ch;
    flex-shrink: 0;
    text-align: center;
}

.spell-card-name {
    flex: 1 1 0;
    min-width: 0;
    max-width: calc(100% - 60px);
    margin-left: auto;
    text-align: right;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    font-weight: bold;
    font-size: 10px;
}

.card-description {
    color: black;
    margin: 5px;
}

.card-back {
    height: 100%;
    width: auto;
    display: block;
    border-radius: 8px;
    border: 5px solid white;
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
