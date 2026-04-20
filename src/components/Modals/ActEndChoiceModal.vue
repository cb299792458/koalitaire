<script setup lang="ts">
    const props = defineProps<{
        actNumber: number
        onLiberateVassal: () => void
        onChallengeFather: () => void
    }>()

</script>

<template>
    <div class="act-end-choice-modal">
        <div class="act-end-choice-modal__panel">
            <h2 class="act-end-choice-modal__title">End of Act {{ props.actNumber }}</h2>
            <p class="act-end-choice-modal__lead">
                The vassal crown lies broken. What comes next for the revolution?
            </p>
            <div class="act-end-choice-modal__actions">
                <button type="button" class="act-end-choice-modal__btn act-end-choice-modal__btn--vassal" @click="props.onLiberateVassal">
                    Liberate another vassal state
                </button>
                <button type="button" class="act-end-choice-modal__btn act-end-choice-modal__btn--lumpur" @click="props.onChallengeFather">
                    Return to Koala Lumpur to challenge your father
                </button>
            </div>
            <p class="act-end-choice-modal__hint">
                Another act means a new path through the provinces and a new tyrant at its end. Koala Lumpur begins the
                final reckoning: every boss you never faced awaits in turn.
            </p>
        </div>
    </div>
</template>

<style scoped>
    .act-end-choice-modal {
        width: 100%;
        max-width: 520px;
        margin: 0 auto;
        padding: 1rem;
    }

    .act-end-choice-modal__panel {
        background: #fffef8;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .act-end-choice-modal__title {
        margin: 0 0 0.75rem 0;
        font-size: 1.5rem;
        color: #222;
    }

    .act-end-choice-modal__lead {
        margin: 0 0 1.25rem 0;
        font-size: 1rem;
        line-height: 1.45;
        color: #444;
    }

    .act-end-choice-modal__actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }

    .act-end-choice-modal__btn {
        padding: 0.75rem 1rem;
        font-size: 1rem;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        text-align: left;
        line-height: 1.35;
        transition: filter 0.15s ease;
    }

    .act-end-choice-modal__btn:hover {
        filter: brightness(1.05);
    }

    .act-end-choice-modal__btn--vassal {
        background: #4caf50;
        color: #fff;
    }

    .act-end-choice-modal__btn--lumpur {
        background: #1565c0;
        color: #fff;
    }

    .act-end-choice-modal__hint {
        margin: 0;
        font-size: 0.85rem;
        line-height: 1.4;
        color: #666;
    }
</style>
