<script setup lang="ts">
import { computed } from "vue";
import SingleCard from "./Cards/SingleCard.vue";
import { useMemory } from "../composables/useMemory";
import { useMinigame } from "../composables/useMinigame";
import MemoryMinigame, {
    ELEPHANT_NAME,
    ELEPHANT_TITLE,
} from "../models/minigames/MemoryMinigame";

const { session, beginPlay, pickCard } = useMemory();

const isIntro = computed(() => session.value?.phase === "intro");
const { currentMinigame } = useMinigame();

const memoryMinigame = computed(() => {
    const mg = currentMinigame.value;
    return mg instanceof MemoryMinigame ? mg : null;
});

const pairsRemaining = computed(() => {
    const slots = session.value?.slots;
    if (!slots) return 0;
    return slots.filter((s) => !s.matched).length / 2;
});
</script>

<template>
    <div v-if="session && memoryMinigame" class="memory-tableau">
        <div class="memory-tableau__host" role="region" :aria-label="`${ELEPHANT_NAME} ${ELEPHANT_TITLE}`">
            <span class="memory-tableau__host-icon" aria-hidden="true">🐘</span>
            <p class="memory-tableau__host-label">{{ ELEPHANT_NAME }}</p>
            <p class="memory-tableau__host-subtitle">{{ ELEPHANT_TITLE }}</p>
            <p v-if="isIntro" class="memory-tableau__host-line">
                His combat cards are scattered face down — he cannot see them. Flip two at a
                time and tell him when they match so he can sort them into pairs.
            </p>
            <ul v-if="isIntro" class="memory-tableau__rules">
                <li>Sort all <strong>eight pairs</strong> to win</li>
                <li>Each wrong pair makes him trumpet — you take <strong>1×act damage</strong></li>
            </ul>
            <button
                v-if="isIntro"
                type="button"
                class="memory-tableau__start primary-action-button"
                @click="beginPlay()"
            >
                Start
            </button>
            <p v-else class="memory-tableau__host-line memory-tableau__host-line--status">
                {{ session.roundMessage }}
            </p>
        </div>

        <template v-if="!isIntro">
        <p class="memory-tableau__meta">
            Pairs left to sort: {{ pairsRemaining }}
        </p>

        <div class="memory-tableau__grid">
            <button
                v-for="slot in session.slots"
                :key="slot.id"
                type="button"
                class="memory-tableau__cell"
                :class="{
                    'memory-tableau__cell--revealed': slot.card.revealed && !slot.matched,
                    'memory-tableau__cell--matched': slot.matched,
                    'memory-tableau__cell--disabled': !session.canPick,
                }"
                :disabled="
                    !session.canPick ||
                    slot.matched ||
                    (slot.card.revealed && session.phase === 'playing')
                "
                @click="pickCard(slot.id)"
            >
                <Transition
                    :name="slot.matched ? 'minigame-match' : 'minigame-reveal'"
                    mode="out-in"
                >
                    <div
                        v-if="!slot.matched"
                        :key="`${slot.id}-${slot.card.revealed}`"
                        class="memory-tableau__card-wrap"
                    >
                        <SingleCard
                            :card="slot.card"
                            :display-as-revealed="slot.card.revealed"
                        />
                    </div>
                </Transition>
            </button>
        </div>
        </template>
    </div>
</template>

<style scoped>
.memory-tableau {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    min-height: 0;
    padding: 8px 12px;
}

.memory-tableau__host {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    max-width: 520px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.55);
    border: 1px solid rgba(57, 78, 89, 0.25);
    border-radius: 10px;
}

.memory-tableau__host-icon {
    font-size: 2.25rem;
    line-height: 1;
}

.memory-tableau__host-label {
    margin: 0;
    font-family: var(--font-game-mono);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #222;
}

.memory-tableau__host-subtitle {
    margin: -4px 0 0;
    font-family: var(--font-game-mono);
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #555;
}

.memory-tableau__host-line {
    margin: 0;
    font-family: var(--font-game-mono);
    font-size: 0.95rem;
    line-height: 1.45;
    text-align: center;
    color: #333;
}

.memory-tableau__host-line--status {
    font-size: 1rem;
    font-weight: 600;
}

.memory-tableau__rules {
    margin: 0;
    padding-left: 1.25rem;
    font-family: var(--font-game-mono);
    font-size: 0.9rem;
    line-height: 1.45;
    color: #333;
    text-align: left;
}

.memory-tableau__rules li {
    margin-bottom: 6px;
}

.memory-tableau__start {
    margin-top: 4px;
    padding: 12px 32px;
    font-size: 1.1rem;
}

.memory-tableau__meta {
    margin: 0;
    font-family: var(--font-game-mono);
    font-size: 1rem;
    text-align: center;
    color: #333;
}

.memory-tableau__grid {
    display: grid;
    grid-template-columns: repeat(4, 120px);
    grid-template-rows: repeat(4, 168px);
    gap: 12px;
    justify-content: center;
}

.memory-tableau__cell {
    width: 120px;
    height: 168px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    transition: transform 0.12s ease;
}

.memory-tableau__cell:hover:not(:disabled) {
    transform: translateY(-2px);
}

.memory-tableau__cell:disabled {
    cursor: default;
}

.memory-tableau__cell--matched {
    pointer-events: none;
    cursor: default;
}

.memory-tableau__cell--disabled:not(.memory-tableau__cell--revealed) {
    opacity: 0.85;
}

.memory-tableau__card-wrap {
    width: 120px;
    height: 168px;
}

.memory-tableau__cell :deep(.card-view) {
    margin: 0;
}
</style>
