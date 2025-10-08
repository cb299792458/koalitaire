<template>
    <div class="modal-content">
        <h2>Test Modal</h2>
        <p>This is just a simple test modal.</p>
        <button @click="$emit('close')">Close</button>
    </div>
</template>

<script setup lang="ts">
    const emit = defineEmits<{
        (e: 'close'): void
    }>()
</script>

<style scoped>
    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        min-width: 300px;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    button {
        align-self: flex-end;
        padding: 0.5rem 1rem;
        cursor: pointer;
    }
</style>
