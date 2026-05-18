<script setup lang="ts">
    import ModalSpellCardShell from './ModalSpellCardShell.vue'

    const props = withDefaults(
        defineProps<{
            message: string
            title?: string
            imageSrc?: string
            onConfirm?: () => void
        }>(),
        {
            title: 'Confirm',
            imageSrc: '/unknown.jpg',
        }
    )

    const emit = defineEmits<{
        (e: 'close'): void
    }>()

    function confirm() {
        props.onConfirm?.()
        emit('close')
    }
</script>

<template>
    <ModalSpellCardShell
        :title="title"
        :description="message"
        :image-src="imageSrc"
        image-alt=""
        size="large"
    >
        <template #footer>
            <button type="button" class="confirm-modal__cancel" @click="emit('close')">Cancel</button>
            <button type="button" class="confirm-modal__confirm" @click="confirm">Confirm</button>
        </template>
    </ModalSpellCardShell>
</template>

<style scoped>
    .confirm-modal__cancel,
    .confirm-modal__confirm {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        font-family: var(--font-game-mono);
        font-weight: bold;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s, filter 0.15s;
    }

    .confirm-modal__cancel {
        background: #e0e0e0;
        color: #333;
        border: 1px solid #ccc;
    }

    .confirm-modal__cancel:hover {
        background: #d0d0d0;
    }

    .confirm-modal__confirm {
        background: #d32f2f;
        color: #fff;
        border: none;
    }

    .confirm-modal__confirm:hover {
        background: #b71c1c;
    }
</style>
