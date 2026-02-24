<script setup lang="ts">
    import { useModalState, closeModal } from '../stores/modalStore'

    const state = useModalState()
</script>

<template>
    <div v-if="state.currentModal && state.currentModal.name !== 'mapDeck'" class="modal-overlay" :class="{ 'modal-overlay--transparent': state.currentModal.transparentOverlay }" @click.self="state.currentModal.keepOpen ? null : closeModal()">
        <component
            :is="state.currentModal.component"
            v-bind="state.currentModal.props"
            @close="closeModal"
        />
    </div>
</template>

<style scoped>
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }
    
    .modal-overlay--transparent {
        background: transparent !important;
    }

</style>
