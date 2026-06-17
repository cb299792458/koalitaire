<script setup lang="ts">
import { computed } from "vue";
import SingleCard from "./Cards/SingleCard.vue";
import { handTotal } from "../game/blackjack";
import { useBlackjack } from "../composables/useBlackjack";
import { useMinigame } from "../composables/useMinigame";
import {
    isBlackjackMinigame,
    RABBATTOIR_NAME,
    RABBATTOIR_TITLE,
} from "../models/minigames/BlackjackMinigame";

const { session, beginPlay } = useBlackjack();

const isIntro = computed(() => session.value?.phase === "intro");
const { currentMinigame } = useMinigame();

const blackjackMinigame = computed(() => {
    const mg = currentMinigame.value;
    return mg && isBlackjackMinigame(mg) ? mg : null;
});

const playerTotal = computed(() =>
    session.value ? handTotal(session.value.playerHand) : 0
);

const rabbattoirTotal = computed(() => {
    if (!session.value) return 0;
    if (session.value.dealerHoleHidden && session.value.dealerHand.length > 0) {
        return handTotal([session.value.dealerHand[0]!]);
    }
    return handTotal(session.value.dealerHand);
});

function showRabbattoirCard(index: number): boolean {
    if (!session.value) return false;
    if (!session.value.dealerHoleHidden) return true;
    return index === 0;
}
</script>

<template>
    <div v-if="session && blackjackMinigame" class="blackjack-tableau">
        <div class="blackjack-tableau__host" role="region" :aria-label="`${RABBATTOIR_NAME} ${RABBATTOIR_TITLE}`">
            <span class="blackjack-tableau__host-icon" aria-hidden="true">🐇</span>
            <p class="blackjack-tableau__host-label">{{ RABBATTOIR_NAME }}</p>
            <p class="blackjack-tableau__host-subtitle">{{ RABBATTOIR_TITLE }}</p>
            <p v-if="isIntro" class="blackjack-tableau__host-line">
                Exiled from the warren — when the rabbit population grows too large, it is his
                grim duty to cull it. He plays to <strong>21</strong>; anything over loses.
                Beat him once with your combat deck to walk away.
            </p>
            <ul v-if="isIntro" class="blackjack-tableau__rules">
                <li>Get as close to <strong>21</strong> as you can — over that and you lose the hand</li>
                <li><strong>Hit</strong> to draw another card or <strong>stay</strong> to hold your total</li>
                <li>Win <strong>one hand</strong> to leave; <strong>ties go to you</strong></li>
                <li>Each loss deals <strong>3×act damage</strong></li>
            </ul>
            <button
                v-if="isIntro"
                type="button"
                class="blackjack-tableau__start primary-action-button"
                @click="beginPlay()"
            >
                Start
            </button>
            <p v-else class="blackjack-tableau__host-line blackjack-tableau__host-line--status">
                {{ session.roundMessage }}
            </p>
        </div>

        <template v-if="!isIntro">
        <p class="blackjack-tableau__meta">
            Hands won: {{ session.wins }} / {{ session.winsRequired }}
            <span v-if="session.phase === 'player'" class="blackjack-tableau__total">
                · Your total: {{ playerTotal }}
            </span>
            <span v-else-if="session.phase === 'dealer' || !session.dealerHoleHidden" class="blackjack-tableau__total">
                · {{ RABBATTOIR_NAME }}: {{ rabbattoirTotal }}
            </span>
        </p>

        <div class="blackjack-tableau__hand blackjack-tableau__hand--dealer">
            <p class="blackjack-tableau__hand-label">{{ RABBATTOIR_NAME }}</p>
            <div class="blackjack-tableau__cards">
                <SingleCard
                    v-for="(card, index) in session.dealerHand"
                    :key="`d-${index}-${card.rank}-${card.suit}-${session.dealerHand.length}`"
                    class="blackjack-tableau__card"
                    :class="{
                        'blackjack-tableau__card--new':
                            session.phase === 'dealer' &&
                            (index === session.dealerHand.length - 1 ||
                                (index === 1 && !session.dealerHoleHidden)),
                    }"
                    :card="card"
                    :display-as-revealed="showRabbattoirCard(index)"
                />
            </div>
        </div>

        <p
            v-if="session.phase === 'round-result'"
            class="blackjack-tableau__status blackjack-tableau__status--result"
        >
            {{ session.roundMessage }}
        </p>

        <div class="blackjack-tableau__hand blackjack-tableau__hand--player">
            <p class="blackjack-tableau__hand-label">Your hand</p>
            <div class="blackjack-tableau__cards">
                <SingleCard
                    v-for="(card, index) in session.playerHand"
                    :key="`p-${index}-${card.rank}-${card.suit}-${card.isSpell ? (card as { name?: string }).name : ''}`"
                    class="blackjack-tableau__card"
                    :class="{
                        'blackjack-tableau__card--new':
                            index === session.playerHand.length - 1 &&
                            session.phase === 'player',
                    }"
                    :card="card"
                    :display-as-revealed="true"
                />
            </div>
        </div>
        </template>
    </div>
</template>

<style scoped>
.blackjack-tableau {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    margin-top: 0;
    padding: 8px 12px 0;
    min-height: 0;
}

.blackjack-tableau__host {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    max-width: 540px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.55);
    border: 1px solid rgba(57, 78, 89, 0.25);
    border-radius: 10px;
}

.blackjack-tableau__host-icon {
    font-size: 2.25rem;
    line-height: 1;
    filter: grayscale(0.85);
}

.blackjack-tableau__host-label {
    margin: 0;
    font-family: var(--font-game-mono);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #222;
}

.blackjack-tableau__host-subtitle {
    margin: -4px 0 0;
    font-family: var(--font-game-mono);
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #555;
}

.blackjack-tableau__host-line {
    margin: 0;
    font-family: var(--font-game-mono);
    font-size: 0.95rem;
    line-height: 1.45;
    text-align: center;
    color: #333;
}

.blackjack-tableau__host-line--status {
    font-size: 1rem;
    font-weight: 600;
}

.blackjack-tableau__rules {
    margin: 0;
    padding-left: 1.25rem;
    font-family: var(--font-game-mono);
    font-size: 0.9rem;
    line-height: 1.45;
    color: #333;
    text-align: left;
}

.blackjack-tableau__rules li {
    margin-bottom: 6px;
}

.blackjack-tableau__start {
    margin-top: 4px;
    padding: 12px 32px;
    font-size: 1.1rem;
}

.blackjack-tableau__meta,
.blackjack-tableau__status {
    margin: 0;
    font-family: var(--font-game-mono);
    font-size: 1rem;
    text-align: center;
    color: #333;
}

.blackjack-tableau__hand {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    width: 100%;
}

.blackjack-tableau__hand-label {
    margin: 0;
    font-family: var(--font-game-mono);
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #444;
}

.blackjack-tableau__cards {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 8px;
    min-height: 168px;
}

.blackjack-tableau__cards :deep(.card-view) {
    margin: 0;
}

.blackjack-tableau__card--new :deep(.card-view) {
    animation: blackjack-card-in 0.4s ease-out;
}

.blackjack-tableau__status--result {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1a1a1a;
}

@keyframes blackjack-card-in {
    from {
        opacity: 0;
        transform: translateY(-14px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
</style>
