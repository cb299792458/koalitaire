<script setup lang="ts">
    withDefaults(
        defineProps<{
            title: string
            description: string
            imageSrc?: string
            imageAlt?: string
            /** Larger card for long message text; keeps 5:7 aspect ratio like play cards. */
            size?: 'default' | 'large'
            showArtwork?: boolean
        }>(),
        {
            imageSrc: '/unknown.jpg',
            imageAlt: '',
            size: 'default',
            showArtwork: true,
        }
    )
</script>

<template>
    <div class="modal-spell-card">
        <div
            class="modal-spell-card__surface game-card-surface"
            :class="{ 'modal-spell-card__surface--large': size === 'large' }"
        >
            <header class="modal-spell-card__top game-card-header">
                <h2 class="modal-spell-card__title game-card-title">{{ title }}</h2>
            </header>
            <div v-if="showArtwork" class="modal-spell-card__artwork game-card-artwork">
                <img
                    :src="imageSrc"
                    :alt="imageAlt"
                    class="modal-spell-card__img"
                />
            </div>
            <div class="modal-spell-card__body game-card-body">
                <p class="modal-spell-card__description game-card-description">{{ description }}</p>
            </div>
            <div v-if="$slots.footer" class="modal-spell-card__footer game-card-footer">
                <slot name="footer" />
            </div>
        </div>
    </div>
</template>

<style scoped>
    .modal-spell-card {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.5rem;
        box-sizing: border-box;
    }

    .modal-spell-card__surface {
        aspect-ratio: 5 / 7;
        width: min(480px, 92vw, calc(90vh * 5 / 7));
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    .modal-spell-card__surface--large {
        width: min(720px, 96vw, calc(92vh * 5 / 7));
        max-height: 92vh;
    }

    /* Same proportional artwork band as spell play cards (~42% of card height). */
    .modal-spell-card__artwork {
        flex: 0 0 42%;
        min-height: 0;
        margin-bottom: 0.35rem;
        display: flex;
        flex-direction: column;
    }

    .modal-spell-card__img {
        flex: 1 1 auto;
        min-height: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .modal-spell-card__surface:has(.modal-spell-card__footer) .modal-spell-card__artwork {
        flex-basis: 36%;
    }

    .modal-spell-card__surface--large .modal-spell-card__description {
        font-size: 1rem;
        line-height: 1.5;
    }
</style>
