<script setup lang="ts">
import { computed } from "vue";
import SingleCard from "./Cards/SingleCard.vue";
import { useMemory } from "../composables/useMemory";
import { useMinigame } from "../composables/useMinigame";
import { isMemoryMinigame } from "../models/minigames/MemoryMinigame";

const { session, beginPlay, pickCard } = useMemory();

const isIntro = computed(() => session.value?.phase === "intro");
const { currentMinigame } = useMinigame();

const memoryMinigame = computed(() => {
    const mg = currentMinigame.value;
    return mg && isMemoryMinigame(mg) ? mg : null;
});

const pairsRemaining = computed(() => {
    const slots = session.value?.slots;
    if (!slots) return 0;
    return slots.filter((s) => !s.matched).length / 2;
});
</script>

<template>
    <div v-if="session && memoryMinigame" class="memory-tableau">
        <div v-if="isIntro" class="minigame-intro">
            <p class="minigame-intro__lead">
                Eight pairs from your combat deck lie face down. Flip two at a time to find
                matches.
            </p>
            <ul class="minigame-intro__rules">
                <li>Clear the board to win</li>
                <li>Each miss deals <strong>1×act damage</strong></li>
            </ul>
            <button type="button" class="minigame-intro__start primary-action-button" @click="beginPlay()">
                Start
            </button>
        </div>

        <template v-else>
        <p class="memory-tableau__meta">
            Pairs left: {{ pairsRemaining }}
        </p>

        <p
            class="memory-tableau__status"
            :class="{ 'memory-tableau__status--result': session.phase !== 'playing' }"
        >
            {{ session.roundMessage }}
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

.memory-tableau__meta,
.memory-tableau__status {
    margin: 0;
    font-family: var(--font-game-mono);
    font-size: 1rem;
    text-align: center;
    color: #333;
}

.memory-tableau__status--result {
    font-weight: 700;
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
