<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import SingleCard from "./Cards/SingleCard.vue";
import { useMinigame } from "../composables/useMinigame";
import { createShellSpellCard } from "../game/cards/shellGameCards";
import {
    createShuffledShellLayout,
    isShellGameMinigame,
    type ShellCardKind,
} from "../models/minigames/ShellGameMinigame";
import type { SpellCard } from "../models/Card";

type Phase = "intro" | "peeking" | "covering" | "shuffling" | "picking" | "revealed";

interface ShellSlot {
    id: number;
    card: ShellCardKind;
    /** Horizontal slot index (0 = left, 1 = center, 2 = right); animated via translateX. */
    position: number;
    spellCard: SpellCard;
}

const SLOT_STEP_PX = 160;
const PEEK_MS = 2000;
const COVER_MS = 500;
const SHUFFLE_SWAPS = 9;
const SHUFFLE_SWAP_MS = 450;
const REVEAL_BEFORE_RESULT_MS = 900;

const { currentMinigame, resolveShellGamePick, resultMessage, isResolving } = useMinigame();

const phase = ref<Phase>("intro");
const slots = ref<ShellSlot[]>([]);
const pickedSlotId = ref<number | null>(null);
const statusText = ref("Watch the cards…");

let nextSlotId = 0;
const timeouts: ReturnType<typeof setTimeout>[] = [];

const shellMinigame = computed(() => {
    const mg = currentMinigame.value;
    return mg && isShellGameMinigame(mg) ? mg : null;
});

const trackWidthPx = computed(() => {
    const n = slots.value.length;
    if (n <= 0) return 0;
    return (n - 1) * SLOT_STEP_PX + 120;
});

function schedule(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms);
    timeouts.push(id);
}

function clearScheduled() {
    for (const id of timeouts) {
        clearTimeout(id);
    }
    timeouts.length = 0;
}

function buildSlots(layout: ShellCardKind[]): ShellSlot[] {
    return layout.map((card, index) => ({
        id: nextSlotId++,
        card,
        position: index,
        spellCard: createShellSpellCard(card),
    }));
}

function setAllCardsRevealed(revealed: boolean) {
    for (const slot of slots.value) {
        slot.spellCard.revealed = revealed;
    }
}

function swapRandomSlots() {
    const list = slots.value;
    if (list.length < 2) return;

    let a = Math.floor(Math.random() * list.length);
    let b = Math.floor(Math.random() * list.length);
    while (b === a) {
        b = Math.floor(Math.random() * list.length);
    }

    slots.value = list.map((slot, index) => {
        if (index === a) return { ...slot, position: list[b]!.position };
        if (index === b) return { ...slot, position: list[a]!.position };
        return slot;
    });
}

function slotTransform(position: number): string {
    return `translateX(${position * SLOT_STEP_PX}px)`;
}

function isFaceUp(): boolean {
    return phase.value === "peeking" || phase.value === "revealed";
}

function isPickingEnabled(): boolean {
    return (
        phase.value === "picking" &&
        pickedSlotId.value === null &&
        !isResolving.value &&
        !resultMessage.value
    );
}

function runShuffleSequence(round: number) {
    if (round >= SHUFFLE_SWAPS) {
        phase.value = "picking";
        statusText.value = "Pick a card!";
        return;
    }
    swapRandomSlots();
    schedule(() => runShuffleSequence(round + 1), SHUFFLE_SWAP_MS);
}

function startSequence() {
    const layout = createShuffledShellLayout();
    nextSlotId = 0;
    slots.value = buildSlots(layout);
    pickedSlotId.value = null;
    phase.value = "peeking";
    statusText.value = "Find the Queen…";
    setAllCardsRevealed(true);

    schedule(() => {
        phase.value = "covering";
        statusText.value = "Cards are turning over…";
        setAllCardsRevealed(false);
    }, PEEK_MS);

    schedule(() => {
        phase.value = "shuffling";
        statusText.value = "Shuffling…";
        runShuffleSequence(0);
    }, PEEK_MS + COVER_MS);
}

function layoutLeftToRight(): ShellCardKind[] {
    return [...slots.value]
        .sort((a, b) => a.position - b.position)
        .map((s) => s.card);
}

function onPick(slot: ShellSlot) {
    if (!isPickingEnabled() || !shellMinigame.value) return;

    pickedSlotId.value = slot.id;
    phase.value = "revealed";
    statusText.value = "Revealing…";
    setAllCardsRevealed(true);

    const sorted = [...slots.value].sort((a, b) => a.position - b.position);
    const pickIndex = sorted.findIndex((s) => s.id === slot.id);

    schedule(() => {
        resolveShellGamePick(pickIndex, layoutLeftToRight());
    }, REVEAL_BEFORE_RESULT_MS);
}

watch(phase, (p) => {
    if (p === "peeking" || p === "revealed") {
        setAllCardsRevealed(true);
    } else if (p === "covering" || p === "shuffling" || p === "picking") {
        setAllCardsRevealed(false);
    }
});

function beginPlay() {
    if (phase.value !== "intro" || !shellMinigame.value) return;
    startSequence();
}

onBeforeUnmount(() => {
    clearScheduled();
});
</script>

<template>
    <div v-if="shellMinigame" class="shell-game-tableau">
        <div v-if="phase === 'intro'" class="minigame-intro">
            <p class="minigame-intro__lead">
                Three cards are shown briefly, then shuffled face down. Find the Queen of
                Hearts to win a spell card; a Joker costs you.
            </p>
            <button type="button" class="minigame-intro__start primary-action-button" @click="beginPlay()">
                Start
            </button>
        </div>

        <template v-else>
        <p class="shell-game-tableau__status">{{ statusText }}</p>

        <div
            class="shell-game-tableau__track"
            :style="{ width: `${trackWidthPx}px` }"
        >
            <button
                v-for="slot in slots"
                :key="slot.id"
                type="button"
                class="shell-game-tableau__slot"
                :class="{
                    'shell-game-tableau__slot--pickable': isPickingEnabled(),
                    'shell-game-tableau__slot--picked': pickedSlotId === slot.id,
                }"
                :style="{ transform: slotTransform(slot.position) }"
                :disabled="!isPickingEnabled()"
                @click="onPick(slot)"
            >
                <div
                    class="shell-card-flip"
                    :class="{ 'shell-card-flip--face-up': isFaceUp() }"
                >
                    <div class="shell-card-flip__inner">
                        <img
                            class="card-back shell-card-flip__back"
                            src="/card_backs/koala.jpg"
                            alt=""
                        />
                        <div class="shell-card-flip__front">
                            <SingleCard
                                :card="slot.spellCard"
                                :display-as-revealed="true"
                            />
                        </div>
                    </div>
                </div>
            </button>
        </div>
        </template>
    </div>
</template>

<style scoped>
.shell-game-tableau {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    margin-top: 12px;
    min-height: 0;
}

.shell-game-tableau__status {
    margin: 0 0 8px;
    font-family: var(--font-game-mono);
    font-size: 1.05rem;
    color: #333;
    text-align: center;
}

.shell-game-tableau__track {
    position: relative;
    height: 188px;
    flex-shrink: 0;
}

.shell-game-tableau__slot {
    position: absolute;
    top: 0;
    left: 0;
    padding: 0;
    border: none;
    background: transparent;
    cursor: default;
    transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
    z-index: 1;
}

.shell-game-tableau__slot--pickable {
    cursor: pointer;
    z-index: 2;
}

.shell-game-tableau__slot--pickable:hover {
    filter: drop-shadow(0 0 10px rgba(76, 175, 80, 0.55));
}

.shell-game-tableau__slot--picked {
    z-index: 3;
}

.shell-card-flip {
    width: 120px;
    height: 168px;
    perspective: 1000px;
}

.shell-card-flip__inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.45s ease;
    transform: rotateY(0deg);
}

.shell-card-flip--face-up .shell-card-flip__inner {
    transform: rotateY(180deg);
}

.shell-card-flip__back,
.shell-card-flip__front {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    border-radius: 10px;
}

.shell-card-flip__back {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    box-sizing: border-box;
    border: 1px solid #333;
}

.shell-card-flip__front {
    transform: rotateY(180deg);
}

.shell-card-flip__front :deep(.card-view) {
    margin: 0;
    width: 120px;
    height: 168px;
}

.shell-card-flip__front :deep(.card-view .card-back) {
    display: none;
}
</style>
