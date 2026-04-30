<script setup lang="ts">
    import ModalSpellCardShell from './ModalSpellCardShell.vue'

    withDefaults(
        defineProps<{
            message: string
            title?: string
            imageSrc?: string
        }>(),
        {
            title: 'Message',
            imageSrc: '/unknown.jpg',
        }
    )
</script>

<template>
    <ModalSpellCardShell
        :title="title"
        :description="message"
        :image-src="imageSrc"
        image-alt=""
    />
</template>
