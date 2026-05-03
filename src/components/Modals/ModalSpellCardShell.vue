<script setup lang="ts">
    withDefaults(
        defineProps<{
            title: string
            description: string
            imageSrc?: string
            imageAlt?: string
        }>(),
        {
            imageSrc: '/unknown.jpg',
            imageAlt: '',
        }
    )
</script>

<template>
    <div class="modal-spell-card">
        <div class="modal-spell-card__surface game-card-surface">
            <header class="modal-spell-card__top game-card-header">
                <h2 class="modal-spell-card__title game-card-title">{{ title }}</h2>
            </header>
            <div class="modal-spell-card__artwork game-card-artwork">
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
        width: min(480px, 92vw);
        height: min(672px, 90vh);
        aspect-ratio: 5 / 7;
        display: flex;
        flex-direction: column;
    }

    .modal-spell-card__artwork {
        height: min(220px, 32vh);
        margin-bottom: 0.35rem;
    }
</style>
