import { markRaw, reactive } from 'vue'
import TestModal from '../components/TestModal.vue'
import CompostModal from '../components/CompostModal.vue'
import StartModal from '../components/StartModal.vue'

export type ModalName = 'test' | 'compost' | 'start'

interface ModalState {
    currentModal: {
        component: any
        props?: Record<string, any>
        keepOpen?: boolean
    } | null
}

// Map of modal names to components
const modals: Record<ModalName, any> = {
    test: markRaw(TestModal),
    compost: markRaw(CompostModal),
    start: markRaw(StartModal),
}

// Reactive state for the current modal
const state = reactive<ModalState>({
    currentModal: null,
})

// Open a modal by name, optionally passing props
export function openModal(name: ModalName, props: Record<string, any> = {}, keepOpen?: boolean) {
    const component = modals[name]
    if (component) {
        state.currentModal = { component, props, keepOpen }
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

