<script setup lang="ts">
    defineProps<{ message: string }>()
</script>

<template>
    <div class="message-modal">
        <h2>Message</h2>
        <p>{{ message }}</p>
    </div>
</template>

<style scoped>
.message-modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 50%;
    gap: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
