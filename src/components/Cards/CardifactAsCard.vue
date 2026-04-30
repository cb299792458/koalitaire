<script setup lang="ts">
    import { computed, ref, watch } from 'vue';
    import type Cardifact from '../../models/Cardifact';
    import { cardArtworkFallbackUrls } from '../../utils/cardArtwork';
    import { formatStatSymbols } from '../../utils/damageSymbol';
    import CardifactCardFace from './CardifactCardFace.vue';

    const props = defineProps<{
        cardifact: Cardifact;
    }>();

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
        const wouldOverflowBottom =
            y + TOOLTIP_OFFSET + height > window.innerHeight - TOOLTIP_EDGE_PADDING;
        return {
            left: x + TOOLTIP_OFFSET + 'px',
            top: wouldOverflowBottom
                ? y - height - TOOLTIP_EDGE_PADDING + 'px'
                : y + TOOLTIP_OFFSET + 'px',
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

    const titleFormatOpts = { replaceBlock: false } as const;

    const artworkFallbacks = computed(() => cardArtworkFallbackUrls(props.cardifact.name));

    const artworkSrc = ref<string | null>(null);
    const artworkVisible = ref(false);

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

    watch(
        () => props.cardifact,
        () => {
            resetArtwork();
        },
        { immediate: true }
    );
</script>

<template>
    <div
        class="card-view cardifact-as-card clickable"
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
                        <CardifactCardFace
                            :cardifact="cardifact"
                            :artwork-src="artworkSrc"
                            :artwork-visible="artworkVisible"
                            :bind-artwork-events="false"
                        />
                    </div>
                </div>
                <div
                    class="card-tooltip-title"
                    v-html="formatStatSymbols(cardifact.name, titleFormatOpts)"
                />
                <div
                    class="card-tooltip-desc"
                    v-html="formatStatSymbols(cardifact.description)"
                />
            </div>
        </Teleport>

        <CardifactCardFace
            :cardifact="cardifact"
            :artwork-src="artworkSrc"
            :artwork-visible="artworkVisible"
            @artwork-error="onArtworkError"
            @artwork-load="onArtworkLoad"
        />
    </div>
</template>

<style scoped>
    .cardifact-as-card.card-view {
        position: relative;
        width: 120px;
        aspect-ratio: 5 / 7;
        background-color: #f5f0d0;
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

    .card-tooltip {
        position: fixed;
        padding: 10px 14px;
        min-width: 280px;
        max-width: 380px;
        background: rgba(0, 0, 0, 0.9);
        color: #fff;
        font-family: var(--font-game-mono);
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
        margin-bottom: 6px;
    }

    .card-tooltip-desc {
        margin-top: 4px;
        color: rgba(255, 255, 255, 0.92);
        font-size: 11px;
    }

    .card-tooltip-title :deep(.suit-symbol),
    .card-tooltip-desc :deep(.suit-symbol) {
        font-size: 1em;
        line-height: 1;
        vertical-align: -0.06em;
    }

    .card-tooltip-title :deep(.suit-symbol svg),
    .card-tooltip-desc :deep(.suit-symbol svg) {
        width: 1em;
        height: 1em;
        vertical-align: -0.06em;
    }
</style>
