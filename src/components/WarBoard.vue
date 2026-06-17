<script setup lang="ts">
import { computed } from "vue";
import SingleCard from "./Cards/SingleCard.vue";
import { useWar } from "../composables/useWar";
import { useMinigame } from "../composables/useMinigame";
import {
    CASSOWAR_NAME,
    PLAYER_CASSOWARY_LABEL,
    RIVAL_CASSOWARY_LABEL,
    isWarMinigame,
} from "../models/minigames/WarMinigame";
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
        <div class="war-tableau__host" role="region" :aria-label="CASSOWAR_NAME">
            <div class="war-tableau__host-icons" aria-hidden="true">
                <span class="war-tableau__host-icon">🪶</span>
                <span class="war-tableau__host-vs">vs</span>
                <span class="war-tableau__host-icon">🪶</span>
            </div>
            <p class="war-tableau__host-label">{{ CASSOWAR_NAME }}</p>
            <p v-if="isIntro" class="war-tableau__host-line">
                Two cassowaries face off — {{ PLAYER_CASSOWARY_LABEL.toLowerCase() }} against
                {{ RIVAL_CASSOWARY_LABEL.toLowerCase() }}. Each flips a card from its deck;
                higher rank wins the clash. Ties go to you.
            </p>
            <ul v-if="isIntro" class="war-tableau__rules">
                <li>Win <strong>three clashes</strong> to leave</li>
                <li>Each loss deals <strong>rank-difference × act</strong> damage</li>
                <li>Run out of cards — <strong>10×act damage</strong></li>
            </ul>
            <button
                v-if="isIntro"
                type="button"
                class="war-tableau__start primary-action-button"
                @click="beginPlay()"
            >
                Start
            </button>
            <p
                v-else-if="session.phase === 'skirmish-result' || session.phase === 'complete'"
                class="war-tableau__host-line war-tableau__host-line--status"
            >
                {{ session.roundMessage }}
            </p>
        </div>

        <template v-if="!isIntro">
        <p class="war-tableau__meta">
            Clashes won: {{ session.wins }} / {{ session.winsRequired }}
        </p>

        <div class="war-tableau__arena">
            <div class="war-tableau__side war-tableau__side--foe">
                <p class="war-tableau__label">{{ RIVAL_CASSOWARY_LABEL }}</p>
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
                    <p class="war-tableau__played-label">Rival plays</p>
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
                    v-if="session.phase !== 'skirmish-result' && session.phase !== 'complete'"
                    class="war-tableau__status"
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
                <p class="war-tableau__label">{{ PLAYER_CASSOWARY_LABEL }}</p>
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
                class="war-tableau__action primary-action-button"
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

.war-tableau__host {
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

.war-tableau__host-icons {
    display: flex;
    align-items: center;
    gap: 10px;
}

.war-tableau__host-icon {
    font-size: 2rem;
    line-height: 1;
}

.war-tableau__host-vs {
    font-family: var(--font-game-mono);
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #666;
}

.war-tableau__host-label {
    margin: 0;
    font-family: var(--font-game-mono);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #222;
}

.war-tableau__host-line {
    margin: 0;
    font-family: var(--font-game-mono);
    font-size: 0.95rem;
    line-height: 1.45;
    text-align: center;
    color: #333;
}

.war-tableau__host-line--status {
    font-size: 1rem;
    font-weight: 600;
}

.war-tableau__rules {
    margin: 0;
    padding-left: 1.25rem;
    font-family: var(--font-game-mono);
    font-size: 0.9rem;
    line-height: 1.45;
    color: #333;
    text-align: left;
}

.war-tableau__rules li {
    margin-bottom: 6px;
}

.war-tableau__start {
    margin-top: 4px;
    padding: 12px 32px;
    font-size: 1.1rem;
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

.war-tableau__actions {
    display: flex;
    justify-content: center;
    min-height: 44px;
}

.war-tableau__action {
    padding: 12px 22px;
    font-size: 1rem;
}
</style>
