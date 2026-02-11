<script setup lang="ts">
    const emit = defineEmits<{
        (e: 'close'): void;
    }>();

    const props = defineProps<{
        message: string;
        onConfirm?: () => void;
    }>();

    function confirm() {
        if (props.onConfirm) {
            props.onConfirm();
        }
        emit('close');
    }

    function cancel() {
        emit('close');
    }
</script>

<template>
    <div class="confirm-modal">
        <div class="modal-content">
            <p class="message">{{ message }}</p>
            <div class="buttons">
                <button type="button" class="cancel-button" @click="cancel">Cancel</button>
                <button type="button" class="confirm-button" @click="confirm">Confirm</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .confirm-modal {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        min-width: 400px;
        max-width: 480px;
    }

    .message {
        margin: 0 0 1.5rem 0;
        font-size: 1.1rem;
        color: #333;
        line-height: 1.5;
    }

    .buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
    }

    .cancel-button,
    .confirm-button {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .cancel-button {
        background: #e0e0e0;
        color: #333;
        border: 1px solid #ccc;
    }

    .cancel-button:hover {
        background: #d0d0d0;
    }

    .confirm-button {
        background: #d32f2f;
        color: white;
        border: none;
    }

    .confirm-button:hover {
        background: #b71c1c;
    }
</style>
