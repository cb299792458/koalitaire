import { markRaw, reactive } from 'vue'
import TestModal from '../components/TestModal.vue'
import CompostModal from '../components/CompostModal.vue'
import TrashModal from '../components/TrashModal.vue'
import StartModal from '../components/StartModal.vue'
import MessageModal from '../components/MessageModal.vue'
import EnemyDefeatedModal from '../components/EnemyDefeatedModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import MapDeckModal from '../components/MapDeckModal.vue'

export type ModalName = 'test' | 'compost' | 'trash' | 'start' | 'message' | 'enemyDefeated' | 'confirmNoReshuffles' | 'mapDeck'

interface ModalState {
    currentModal: {
        name: ModalName
        component: any
        props?: Record<string, any>
        keepOpen?: boolean
    } | null
}

// Map of modal names to components
const modals: Record<ModalName, any> = {
    test: markRaw(TestModal),
    compost: markRaw(CompostModal),
    trash: markRaw(TrashModal),
    start: markRaw(StartModal),
    message: markRaw(MessageModal),
    enemyDefeated: markRaw(EnemyDefeatedModal),
    confirmNoReshuffles: markRaw(ConfirmModal),
    mapDeck: markRaw(MapDeckModal),
}

// Reactive state for the current modal
const state = reactive<ModalState>({
    currentModal: null,
})

// Open a modal by name, optionally passing props
export function openModal(name: ModalName, props: Record<string, any> = {}, keepOpen?: boolean) {
    const component = modals[name]
    if (component) {
        state.currentModal = { name, component, props, keepOpen }
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

