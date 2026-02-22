<script setup lang="ts">
    const emit = defineEmits<{
        (e: 'close'): void;
    }>();

    const props = defineProps<{
        /** Called when Continue is clicked. Return false to prevent closing (e.g. when opening another modal). */
        onContinue?: () => void | boolean;
    }>();

    function continueGame() {
        const result = props.onContinue?.();
        if (result !== false) {
            emit('close');
        }
    }
</script>

<template>
    <div class="enemy-defeated-modal">
        <div class="modal-content">
            <h2>Enemy Defeated</h2>
            <button @click="continueGame" class="continue-button">Continue</button>
        </div>
    </div>
</template>

<style scoped>
    .enemy-defeated-modal {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .modal-content {
        background: white;
        padding: 3rem;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        min-width: 400px;
    }

    h2 {
        margin: 0 0 2rem 0;
        font-size: 2.5rem;
        color: #333;
    }

    .continue-button {
        padding: 1rem 2rem;
        font-size: 1.2rem;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .continue-button:hover {
        background: #45a049;
    }

    .continue-button:active {
        background: #3d8b40;
    }
</style>
