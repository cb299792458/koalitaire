<script setup lang="ts">
    defineProps<{ message: string }>()
</script>

<template>
    <div class="modal">
        <h2>Message</h2>
        <p>{{ message }}</p>
    </div>
</template>
