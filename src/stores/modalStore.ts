import { markRaw, reactive } from 'vue'
import CardListModal from '../components/Modals/CardListModal.vue'
import StartModal from '../components/Modals/StartModal.vue'
import MessageModal from '../components/Modals/MessageModal.vue'
import CardRewardModal from '../components/Modals/CardRewardModal.vue'
import ConfirmModal from '../components/Modals/ConfirmModal.vue'
import BackAtCampModal from '../components/Modals/BackAtCampModal.vue'
import CardifactPickModal from '../components/Modals/CardifactPickModal.vue'
import EliteRelicRewardModal from '../components/Modals/EliteRelicRewardModal.vue'

export type ModalName = 'compost' | 'trash' | 'start' | 'message' | 'cardReward' | 'confirmNoReshuffles' | 'backAtCamp' | 'cardifactPick' | 'eliteRelicReward'

export interface OpenModalOptions {
    keepOpen?: boolean
    transparentOverlay?: boolean
}

interface ModalInstance {
    name: ModalName
    component: unknown
    /** Modal-specific props; typed loosely so consumers can pass them to modal components. */
    props: Record<string, any>
    keepOpen?: boolean
    transparentOverlay?: boolean
}

interface ModalState {
    currentModal: ModalInstance | null
}

const modals: Record<ModalName, unknown> = {
    compost: markRaw(CardListModal),
    trash: markRaw(CardListModal),
    start: markRaw(StartModal),
    message: markRaw(MessageModal),
    cardReward: markRaw(CardRewardModal),
    confirmNoReshuffles: markRaw(ConfirmModal),
    backAtCamp: markRaw(BackAtCampModal),
    cardifactPick: markRaw(CardifactPickModal),
    eliteRelicReward: markRaw(EliteRelicRewardModal),
}

const state = reactive<ModalState>({ currentModal: null })

export function openModal(
    name: ModalName,
    props: Record<string, any> = {},
    options?: OpenModalOptions
) {
    const component = modals[name]
    if (component) {
        state.currentModal = {
            name,
            component,
            props,
            keepOpen: options?.keepOpen,
            transparentOverlay: options?.transparentOverlay,
        }
    } else {
        console.warn(`Modal "${name}" does not exist.`)
    }
}

export function openMessageModal(message: string, keepOpen?: boolean) {
    openModal('message', { message }, { keepOpen })
}

// Close the current modal
export function closeModal() {
    state.currentModal = null
}

// Access modal state in components
export function useModalState() {
    return state
}

