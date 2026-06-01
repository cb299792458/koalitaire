<script setup lang="ts">
import { computed } from "vue";
import SingleCard from "./Cards/SingleCard.vue";
import { handTotal } from "../game/blackjack";
import { useBlackjack } from "../composables/useBlackjack";
import { useMinigame } from "../composables/useMinigame";
import { isBlackjackMinigame } from "../models/minigames/BlackjackMinigame";

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

const dealerTotal = computed(() => {
    if (!session.value) return 0;
    if (session.value.dealerHoleHidden && session.value.dealerHand.length > 0) {
        return handTotal([session.value.dealerHand[0]!]);
    }
    return handTotal(session.value.dealerHand);
});

function showDealerCard(index: number): boolean {
    if (!session.value) return false;
    if (!session.value.dealerHoleHidden) return true;
    return index === 0;
}
</script>

<template>
    <div v-if="session && blackjackMinigame" class="blackjack-tableau">
        <div v-if="isIntro" class="minigame-intro">
            <p class="minigame-intro__lead">
                Play blackjack with your combat deck against the dealer. Beat the dealer’s
                total without going over 21.
            </p>
            <ul class="minigame-intro__rules">
                <li>Get as close to <strong>21</strong> as you can — going over is a <strong>bust</strong> and you lose the hand</li>
                <li><strong>Hit</strong> to draw another card or <strong>stay</strong> to hold your total</li>
                <li>Win <strong>one hand</strong> to leave the table; <strong>ties go to you</strong></li>
                <li>Each loss deals <strong>3×act damage</strong></li>
            </ul>
            <button type="button" class="minigame-intro__start" @click="beginPlay()">
                Start
            </button>
        </div>

        <template v-else>
        <p class="blackjack-tableau__meta">
            Wins: {{ session.wins }} / {{ session.winsRequired }}
            <span v-if="session.phase === 'player'" class="blackjack-tableau__total">
                · Your total: {{ playerTotal }}
            </span>
            <span v-else-if="session.phase === 'dealer' || !session.dealerHoleHidden" class="blackjack-tableau__total">
                · Dealer: {{ dealerTotal }}
            </span>
        </p>

        <div class="blackjack-tableau__hand blackjack-tableau__hand--dealer">
            <p class="blackjack-tableau__hand-label">Dealer</p>
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
                    :display-as-revealed="showDealerCard(index)"
                />
            </div>
        </div>

        <p
            class="blackjack-tableau__status"
            :class="{ 'blackjack-tableau__status--result': session.phase === 'round-result' }"
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
    gap: 8px;
    width: 100%;
    margin-top: 0;
    padding-top: 0;
    min-height: 0;
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
