<script setup lang="ts">
    import { computed, ref, watch } from 'vue';
    import type Cardifact from '../../models/Cardifact';
    import { cardArtworkFallbackUrls } from '../../utils/cardArtwork';
    import { formatStatSymbols } from '../../utils/damageSymbol';
    import CardifactCardFace from './CardifactCardFace.vue';

    const props = defineProps<{
        cardifact: Cardifact;
    }>();

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
    <div class="cardifact-tooltip-content">
        <div class="cardifact-tooltip-content__preview-wrap">
            <div class="cardifact-tooltip-content__preview-inner card-view">
                <CardifactCardFace
                    :cardifact="cardifact"
                    :artwork-src="artworkSrc"
                    :artwork-visible="artworkVisible"
                    :bind-artwork-events="true"
                    @artwork-error="onArtworkError"
                    @artwork-load="onArtworkLoad"
                />
            </div>
        </div>
        <div
            class="cardifact-tooltip-content__title"
            v-html="formatStatSymbols(cardifact.name, titleFormatOpts)"
        />
        <div
            class="cardifact-tooltip-content__desc"
            v-html="formatStatSymbols(cardifact.description)"
        />
    </div>
</template>

<style scoped>
    .cardifact-tooltip-content {
        min-width: 0;
    }

    .cardifact-tooltip-content__preview-wrap {
        width: 240px;
        height: 336px;
        margin-bottom: 10px;
        flex-shrink: 0;
    }

    .cardifact-tooltip-content__preview-inner {
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

    .cardifact-tooltip-content__title {
        font-weight: 600;
        margin-bottom: 6px;
    }

    .cardifact-tooltip-content__desc {
        margin-top: 4px;
        color: rgba(255, 255, 255, 0.92);
        font-size: 11px;
    }

    .cardifact-tooltip-content__title :deep(.suit-symbol),
    .cardifact-tooltip-content__desc :deep(.suit-symbol) {
        font-size: 1em;
        line-height: 1;
        vertical-align: -0.06em;
    }

    .cardifact-tooltip-content__title :deep(.suit-symbol svg),
    .cardifact-tooltip-content__desc :deep(.suit-symbol svg) {
        width: 1em;
        height: 1em;
        vertical-align: -0.06em;
    }
</style>
