import { markRaw, reactive } from 'vue'
import CardListModal from '../components/Modals/CardListModal.vue'
import StartModal from '../components/Modals/StartModal.vue'
import MessageModal from '../components/Modals/MessageModal.vue'
import CardRewardModal from '../components/Modals/CardRewardModal.vue'
import ConfirmModal from '../components/Modals/ConfirmModal.vue'
import BackAtCampModal from '../components/Modals/BackAtCampModal.vue'

export type ModalName = 'compost' | 'trash' | 'start' | 'message' | 'cardReward' | 'confirmNoReshuffles' | 'backAtCamp'

interface ModalState {
    currentModal: {
        name: ModalName
        component: any
        props?: Record<string, any>
        keepOpen?: boolean
        transparentOverlay?: boolean
    } | null
}

// Map of modal names to components
const modals: Record<ModalName, any> = {
    compost: markRaw(CardListModal),
    trash: markRaw(CardListModal),
    start: markRaw(StartModal),
    message: markRaw(MessageModal),
    cardReward: markRaw(CardRewardModal),
    confirmNoReshuffles: markRaw(ConfirmModal),
    backAtCamp: markRaw(BackAtCampModal),
}

// Reactive state for the current modal
const state = reactive<ModalState>({
    currentModal: null,
})

// Open a modal by name, optionally passing props
export function openModal(name: ModalName, props: Record<string, any> = {}, keepOpen?: boolean, transparentOverlay?: boolean) {
    const component = modals[name]
    if (component) {
        state.currentModal = { name, component, props, keepOpen, transparentOverlay }
    } else {
        console.warn(`Modal "${name}" does not exist.`)
    }
}

export function openMessageModal(message: string, keepOpen?: boolean) {
    openModal('message', { message }, keepOpen)
}

// Close the current modal
export function closeModal() {
    state.currentModal = null
}

// Access modal state in components
export function useModalState() {
    return state
}

