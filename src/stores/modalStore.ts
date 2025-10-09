import { reactive } from 'vue'
import TestModal from '../components/TestModal.vue'
import CompostModal from '../components/CompostModal.vue'

export type ModalName = 'test' | 'compost'

interface ModalState {
    currentModal: {
        component: any
        props?: Record<string, any>
    } | null
}

// Map of modal names to components
const modals: Record<ModalName, any> = {
    test: TestModal,
    compost: CompostModal
}

// Reactive state for the current modal
const state = reactive<ModalState>({
    currentModal: null,
})

// Open a modal by name, optionally passing props
export function openModal(name: ModalName, props: Record<string, any> = {}) {
    const component = modals[name]
    if (component) {
        state.currentModal = { component, props }
    } else {
        console.warn(`Modal "${name}" does not exist.`)
    }
}

// Close the current modal
export function closeModal() {
    state.currentModal = null
}

// Access modal state in components
export function useModalState() {
    return state
}
