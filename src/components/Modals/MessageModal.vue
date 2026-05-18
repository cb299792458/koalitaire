<script setup lang="ts">
    import ModalSpellCardShell from './ModalSpellCardShell.vue'

    interface MessageModalAction {
        label: string
        onClick: () => void
        disabled?: boolean
    }

    withDefaults(
        defineProps<{
            message: string
            title?: string
            imageSrc?: string
            actions?: MessageModalAction[]
        }>(),
        {
            title: 'Message',
            imageSrc: '/unknown.jpg',
            actions: () => [],
        }
    )
</script>

<template>
    <ModalSpellCardShell
        :title="title"
        :description="message"
        :image-src="imageSrc"
        image-alt=""
        size="large"
    >
        <template v-if="actions.length > 0" #footer>
            <button
                v-for="(action, index) in actions"
                :key="index"
                type="button"
                class="message-modal__action game-card-action-btn"
                :disabled="action.disabled"
                @click="action.onClick"
            >
                {{ action.label }}
            </button>
        </template>
    </ModalSpellCardShell>
</template>

<style scoped>
    .message-modal__action {
        flex: 1 1 0;
    }
</style>
