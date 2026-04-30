<script setup lang="ts">
    import type Cardifact from '../../models/Cardifact';
    import { formatStatSymbols } from '../../utils/damageSymbol';

    const props = withDefaults(
        defineProps<{
            cardifact: Cardifact;
            artworkSrc: string | null;
            artworkVisible: boolean;
            /** When false (e.g. tooltip preview), image errors are not fed into the parent fallback chain. */
            bindArtworkEvents?: boolean;
        }>(),
        { bindArtworkEvents: true }
    );

    const emit = defineEmits<{
        (e: 'artwork-error'): void;
        (e: 'artwork-load'): void;
    }>();

    const titleFormatOpts = { replaceBlock: false } as const;

    function onImgError() {
        if (props.bindArtworkEvents) emit('artwork-error');
    }

    function onImgLoad() {
        if (props.bindArtworkEvents) emit('artwork-load');
    }
</script>

<template>
    <div class="cardifact-face card-front spell-card-front">
        <div class="card-top spell-card-top card-suit-none cardifact-face__top">
            <span
                class="spell-card-name cardifact-face__name"
                v-html="formatStatSymbols(cardifact.name, titleFormatOpts)"
            />
        </div>
        <div v-if="artworkVisible && artworkSrc" class="card-artwork-container">
            <img
                :src="artworkSrc"
                :alt="cardifact.name"
                class="card-artwork"
                @error="onImgError"
                @load="onImgLoad"
            />
        </div>
        <div class="spell-card-bottom">
            <p
                class="card-description spell-card-description"
                v-html="formatStatSymbols(cardifact.description)"
            />
        </div>
    </div>
</template>

<style scoped>
    .cardifact-face {
        display: flex;
        flex-direction: column;
        height: 100%;
        position: relative;
        padding: 2px;
        padding-bottom: 36px;
        box-sizing: border-box;
        overflow: hidden;
    }

    .cardifact-face__top {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: calc(100% - 6px);
        max-width: calc(100% - 6px);
        margin: 0 3px;
        min-width: 0;
        box-sizing: border-box;
        flex-shrink: 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }

    .cardifact-face__name {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        text-overflow: ellipsis;
        text-align: left;
        white-space: normal;
        font-family: var(--font-game-mono);
        font-weight: bold;
        font-size: 9px;
        line-height: 1.15;
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
        font-family: var(--font-game-mono);
        font-weight: bold;
        font-size: 10px;
    }

    .spell-card-description :deep(.suit-symbol),
    .cardifact-face__name :deep(.suit-symbol) {
        font-size: 1em;
        line-height: 1;
        vertical-align: -0.06em;
    }

    .spell-card-description :deep(.suit-symbol svg),
    .cardifact-face__name :deep(.suit-symbol svg) {
        width: 1em;
        height: 1em;
        vertical-align: -0.06em;
    }
</style>
