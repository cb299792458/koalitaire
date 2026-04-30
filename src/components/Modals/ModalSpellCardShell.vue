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
        <div class="modal-spell-card__surface">
            <header class="modal-spell-card__top">
                <h2 class="modal-spell-card__title">{{ title }}</h2>
            </header>
            <div class="modal-spell-card__artwork">
                <img
                    :src="imageSrc"
                    :alt="imageAlt"
                    class="modal-spell-card__img"
                />
            </div>
            <div class="modal-spell-card__body">
                <p class="modal-spell-card__description">{{ description }}</p>
            </div>
            <div v-if="$slots.footer" class="modal-spell-card__footer">
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
        width: min(440px, 94vw);
        max-height: min(85vh, 640px);
        background: #f5f0d0;
        border: 1px solid #000;
        border-radius: 10px;
        box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        color: #000;
        box-sizing: border-box;
    }

    .modal-spell-card__top {
        flex-shrink: 0;
        padding: 0.65rem 0.9rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }

    .modal-spell-card__title {
        margin: 0;
        font-family: var(--font-game-mono);
        font-weight: bold;
        font-size: 1.08rem;
        line-height: 1.2;
        text-align: center;
    }

    .modal-spell-card__artwork {
        flex-shrink: 0;
        height: min(220px, 32vh);
        margin: 0.55rem 0.75rem 0;
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.08);
        overflow: hidden;
    }

    .modal-spell-card__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .modal-spell-card__body {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding: 0.55rem 0.9rem 0.85rem;
    }

    .modal-spell-card__description {
        margin: 0;
        font-family: var(--font-game-mono);
        font-weight: bold;
        font-size: 0.92rem;
        line-height: 1.45;
        white-space: pre-line;
        text-align: center;
    }

    .modal-spell-card__footer {
        flex-shrink: 0;
        padding: 0.75rem 1rem 1rem;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        justify-content: center;
    }
</style>
