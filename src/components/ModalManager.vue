<script setup lang="ts">
    import { computed } from 'vue'
    import { useModalState, closeModal } from '../stores/modalStore'

    const state = useModalState()
    const currentModal = computed(() => state.currentModal)
    const isTransparentOverlay = computed(
        () =>
            currentModal.value?.transparentOverlay ||
            currentModal.value?.name === 'backAtCamp' ||
            currentModal.value?.name === 'actEndChoice'
    )
    const handleOverlayClick = () => {
        if (!currentModal.value?.keepOpen) closeModal()
    }
</script>

<template>
    <div
        v-if="currentModal"
        class="modal-overlay"
        :class="{ 'modal-overlay--transparent': isTransparentOverlay }"
        @click.self="handleOverlayClick"
    >
        <component
            :is="currentModal.component"
            v-bind="currentModal.props"
            @close="closeModal"
        />
    </div>
</template>

<style scoped>
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }

    .modal-overlay--transparent {
        background: transparent !important;
    }
</style>
