<script setup lang="ts">
import { computed } from "vue";
import SingleCard from "./Cards/SingleCard.vue";
import { useWar } from "../composables/useWar";
import { useMinigame } from "../composables/useMinigame";
import { isWarMinigame } from "../models/minigames/WarMinigame";
import type Card from "../models/Card";

const { session, beginPlay, flipPlayerCard } = useWar();

const isIntro = computed(() => session.value?.phase === "intro");
const { currentMinigame } = useMinigame();

const warMinigame = computed(() => {
    const mg = currentMinigame.value;
    return mg && isWarMinigame(mg) ? mg : null;
});

const playerDeckTop = computed((): Card | null => {
    const pile = session.value?.playerPile;
    return pile && pile.length > 0 ? pile[0]! : null;
});

const opponentDeckTop = computed((): Card | null => {
    const pile = session.value?.opponentPile;
    return pile && pile.length > 0 ? pile[0]! : null;
});

function deckStackStyle(layer: number): Record<string, string> {
    const offset = layer * 3;
    return {
        transform: `translate(${offset}px, ${-offset}px)`,
        zIndex: String(layer),
    };
}
</script>

<template>
    <div v-if="session && warMinigame" class="war-tableau">
        <div v-if="isIntro" class="minigame-intro">
            <p class="minigame-intro__lead">
                Your shuffled combat deck faces a random opposing deck. Flip your top card;
                higher rank wins the battle. Ties go to you.
            </p>
            <ul class="minigame-intro__rules">
                <li>Win <strong>three battles</strong> to leave</li>
                <li>Each loss deals <strong>rank-difference × act</strong> damage</li>
                <li>Run out of cards — <strong>10×act damage</strong></li>
            </ul>
            <button type="button" class="minigame-intro__start" @click="beginPlay()">
                Start
            </button>
        </div>

        <template v-else>
        <p class="war-tableau__meta">
            Victories: {{ session.wins }} / {{ session.winsRequired }}
        </p>

        <div class="war-tableau__arena">
            <div class="war-tableau__side war-tableau__side--foe">
                <p class="war-tableau__label">Foe deck</p>
                <div class="war-tableau__deck">
                    <div
                        v-for="layer in 3"
                        :key="`o-stack-${layer}`"
                        class="war-tableau__deck-layer"
                        :style="deckStackStyle(layer - 1)"
                    >
                        <SingleCard
                            v-if="opponentDeckTop"
                            :card="opponentDeckTop"
                            :display-as-revealed="false"
                        />
                    </div>
                </div>
            </div>

            <div class="war-tableau__center">
                <div class="war-tableau__played war-tableau__played--foe">
                    <p class="war-tableau__played-label">Foe plays</p>
                    <div class="war-tableau__played-cards">
                        <Transition name="minigame-deal" mode="out-in">
                            <div
                                v-if="session.opponentCard"
                                :key="`o-${session.opponentCard.rank}-${session.opponentCard.suit}-${session.opponentCard.revealed}`"
                                class="war-tableau__face-card"
                            >
                                <SingleCard
                                    :card="session.opponentCard"
                                    :display-as-revealed="session.opponentCard.revealed"
                                />
                            </div>
                        </Transition>
                    </div>
                </div>

                <p
                    class="war-tableau__status"
                    :class="{ 'war-tableau__status--result': session.phase === 'skirmish-result' }"
                >
                    {{ session.roundMessage }}
                </p>

                <div class="war-tableau__played war-tableau__played--player">
                    <p class="war-tableau__played-label">You play</p>
                    <div class="war-tableau__played-cards">
                        <Transition name="minigame-deal" mode="out-in">
                            <div
                                v-if="session.playerCard"
                                :key="`p-${session.playerCard.rank}-${session.playerCard.suit}`"
                                class="war-tableau__face-card"
                            >
                                <SingleCard
                                    :card="session.playerCard"
                                    :display-as-revealed="session.playerCard.revealed"
                                />
                            </div>
                        </Transition>
                    </div>
                </div>
            </div>

            <div class="war-tableau__side war-tableau__side--player">
                <p class="war-tableau__label">Your deck</p>
                <div class="war-tableau__deck">
                    <div
                        v-for="layer in 3"
                        :key="`p-stack-${layer}`"
                        class="war-tableau__deck-layer"
                        :style="deckStackStyle(layer - 1)"
                    >
                        <SingleCard
                            v-if="playerDeckTop"
                            :card="playerDeckTop"
                            :display-as-revealed="false"
                        />
                    </div>
                </div>
            </div>
        </div>

        <div class="war-tableau__actions">
            <button
                v-if="session.canFlip"
                type="button"
                class="war-tableau__action"
                @click="flipPlayerCard()"
            >
                Flip top card
            </button>
        </div>
        </template>
    </div>
</template>

<style scoped>
.war-tableau {
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

.war-tableau__meta,
.war-tableau__status {
    margin: 0;
    font-family: var(--font-game-mono);
    font-size: 1rem;
    text-align: center;
    color: #333;
}

.war-tableau__arena {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 20px;
    width: 100%;
    max-width: 720px;
}

.war-tableau__side {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.war-tableau__center {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    min-width: 0;
}

.war-tableau__label,
.war-tableau__played-label {
    margin: 0;
    font-family: var(--font-game-mono);
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #444;
}

.war-tableau__deck {
    position: relative;
    width: 120px;
    height: 168px;
}

.war-tableau__deck-layer {
    position: absolute;
    top: 0;
    left: 0;
}

.war-tableau__deck-layer :deep(.card-view) {
    margin: 0;
}

.war-tableau__played-cards {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 10px;
    min-height: 176px;
}

.war-tableau__face-card {
    position: relative;
}

.war-tableau__face-card :deep(.card-view) {
    margin: 0;
}

.war-tableau__status--result {
    font-size: 1.05rem;
    font-weight: 700;
}

.war-tableau__actions {
    display: flex;
    justify-content: center;
    min-height: 44px;
}

.war-tableau__action {
    padding: 12px 22px;
    font-family: var(--font-game-mono);
    font-size: 1rem;
    font-weight: 600;
    border-radius: 6px;
    border: 1px solid #888;
    background: #f0f0f0;
    cursor: pointer;
}

.war-tableau__action:hover {
    background: #e4e4e4;
}
</style>
