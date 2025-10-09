<template>
    <div class="modal">
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
