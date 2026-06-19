<script setup lang="ts">
import { computed } from "vue";
import SingleCard from "./Cards/SingleCard.vue";
import { useHigherOrLower } from "../composables/useHigherOrLower";
import { useMinigame } from "../composables/useMinigame";
import HigherOrLowerMinigame from "../models/minigames/HigherOrLowerMinigame";

const { session, beginPlay, guessHigher, guessLower } = useHigherOrLower();

const isIntro = computed(() => session.value?.phase === "intro");
const { currentMinigame } = useMinigame();

const holMinigame = computed(() => {
    const mg = currentMinigame.value;
    return mg instanceof HigherOrLowerMinigame ? mg : null;
});
</script>

<template>
    <div v-if="session && holMinigame" class="hol-tableau">
        <div v-if="isIntro" class="minigame-intro">
            <p class="minigame-intro__lead">
                Guess whether the next card from your deck is higher or lower than the one
                showing.
            </p>
            <ul class="minigame-intro__rules">
                <li>Win <strong>five rounds</strong> to leave</li>
                <li><strong>Ties</strong> count as a win</li>
                <li>Each wrong guess deals <strong>3×act damage</strong></li>
            </ul>
            <button type="button" class="minigame-intro__start primary-action-button" @click="beginPlay()">
                Start
            </button>
        </div>

        <template v-else>
        <p class="hol-tableau__meta">
            Victories: {{ session.wins }} / {{ session.winsRequired }}
        </p>

        <div class="hol-tableau__cards">
            <div class="hol-tableau__card-slot">
                <p class="hol-tableau__label">Current</p>
                <div v-if="session.currentCard" class="hol-tableau__card-wrap">
                    <SingleCard
                        :card="session.currentCard"
                        :display-as-revealed="true"
                    />
                </div>
            </div>

            <div
                v-if="session.nextCard"
                class="hol-tableau__arrow"
                aria-hidden="true"
            >
                →
            </div>

            <div
                v-if="session.nextCard"
                class="hol-tableau__card-slot"
            >
                <p class="hol-tableau__label">Next</p>
                <div class="hol-tableau__card-wrap">
                    <SingleCard
                        :card="session.nextCard"
                        :display-as-revealed="session.nextCard.revealed"
                    />
                </div>
            </div>
        </div>

        <p
            class="hol-tableau__status"
            :class="{ 'hol-tableau__status--result': session.phase === 'round-result' }"
        >
            {{ session.roundMessage }}
        </p>

        <div class="hol-tableau__actions">
            <button
                type="button"
                class="hol-tableau__action"
                :disabled="!session.canGuess"
                @click="guessHigher()"
            >
                Higher
            </button>
            <button
                type="button"
                class="hol-tableau__action"
                :disabled="!session.canGuess"
                @click="guessLower()"
            >
                Lower
            </button>
        </div>
        </template>
    </div>
</template>

<style scoped>
.hol-tableau {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    width: 100%;
    min-height: 0;
    padding: 8px 12px;
}

.hol-tableau__meta,
.hol-tableau__status,
.hol-tableau__label {
    margin: 0;
    font-family: var(--font-game-mono);
    font-size: 1rem;
    text-align: center;
    color: #333;
}

.hol-tableau__label {
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #444;
}

.hol-tableau__status--result {
    font-weight: 700;
}

.hol-tableau__cards {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 20px;
}

.hol-tableau__card-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.hol-tableau__card-wrap {
    width: 120px;
    height: 168px;
}

.hol-tableau__card-slot :deep(.card-view) {
    margin: 0;
}

.hol-tableau__action:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.hol-tableau__arrow {
    font-family: var(--font-game-mono);
    font-size: 2rem;
    color: #555;
    padding-top: 24px;
}

.hol-tableau__actions {
    display: flex;
    flex-direction: row;
    gap: 12px;
    min-height: 44px;
}

.hol-tableau__action {
    padding: 12px 22px;
    font-family: var(--font-game-mono);
    font-size: 1rem;
    font-weight: 600;
    border-radius: 6px;
    border: 1px solid #888;
    background: #f0f0f0;
    cursor: pointer;
}

.hol-tableau__action:hover {
    background: #e4e4e4;
}
</style>
