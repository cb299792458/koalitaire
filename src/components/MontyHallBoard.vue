<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import SingleCard from "./Cards/SingleCard.vue";
import { createMontyHallSpellCard } from "../game/cards/montyHallCards";
import { useMinigame } from "../composables/useMinigame";
import {
    createMontyLayout,
    isMontyHallMinigame,
    pickDoorToReveal,
    switchDoorIndex,
    type MontyCardKind,
} from "../models/minigames/MontyHallMinigame";
import type { SpellCard } from "../models/Card";

type Phase = "intro" | "picking" | "revealing" | "decide" | "final" | "done";

interface MontySlot {
    id: number;
    card: MontyCardKind;
    spellCard: SpellCard;
    revealed: boolean;
}

const SLOT_STEP_PX = 160;
const REVEAL_LOSER_MS = 700;
const FINAL_REVEAL_MS = 900;
const BEFORE_RESULT_MS = 1100;

const { currentMinigame, resolveMontyHallFinal, resultMessage, isResolving } = useMinigame();

const phase = ref<Phase>("intro");
const slots = ref<MontySlot[]>([]);
const layout = ref<MontyCardKind[]>([]);
const initialPick = ref<number | null>(null);
const revealedDoor = ref<number | null>(null);
const finalPick = ref<number | null>(null);
const hostLine = ref("");

let nextSlotId = 0;
const timeouts: ReturnType<typeof setTimeout>[] = [];

const montyMinigame = computed(() => {
    const mg = currentMinigame.value;
    return mg && isMontyHallMinigame(mg) ? mg : null;
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

function buildSlots(cardLayout: MontyCardKind[]): MontySlot[] {
    return cardLayout.map((card) => ({
        id: nextSlotId++,
        card,
        spellCard: createMontyHallSpellCard(card),
        revealed: false,
    }));
}

function setSlotRevealed(index: number, revealed: boolean) {
    const slot = slots.value[index];
    if (!slot) return;
    slot.revealed = revealed;
    slot.spellCard.revealed = revealed;
}

function revealAll() {
    for (let i = 0; i < slots.value.length; i++) {
        setSlotRevealed(i, true);
    }
}

function slotTransform(index: number): string {
    return `translateX(${index * SLOT_STEP_PX}px)`;
}

function isFaceUp(index: number): boolean {
    return slots.value[index]?.revealed ?? false;
}

function canPick(_index: number): boolean {
    return (
        phase.value === "picking" &&
        initialPick.value === null &&
        !isResolving.value &&
        !resultMessage.value
    );
}

function startIntro() {
    hostLine.value =
        "Welcome, traveler! Behind one card lies a prize; the other two are blank. Pick a card — then I, your humble goat host, will turn over one blank you did not choose. You may stay with your pick or switch to the last hidden card. Choose wisely!";
    phase.value = "intro";
}

function beginPicking() {
    const cardLayout = createMontyLayout();
    layout.value = cardLayout;
    nextSlotId = 0;
    slots.value = buildSlots(cardLayout);
    initialPick.value = null;
    revealedDoor.value = null;
    finalPick.value = null;
    phase.value = "picking";
    hostLine.value = "Pick one of the three cards.";
}

function onPick(index: number) {
    if (!canPick(index) || !montyMinigame.value) return;

    initialPick.value = index;
    phase.value = "revealing";
    hostLine.value = "Let me show you one of the blanks you did not choose…";

    const revealIndex = pickDoorToReveal(index, layout.value);
    revealedDoor.value = revealIndex;

    schedule(() => {
        setSlotRevealed(revealIndex, true);
        phase.value = "decide";
        hostLine.value =
            "You may keep your card or switch to the other hidden card. Statistically, switching is often wiser — but the choice is yours.";
    }, REVEAL_LOSER_MS);
}

function resolveWithFinal(index: number) {
    if (!montyMinigame.value || phase.value !== "decide") return;

    finalPick.value = index;
    phase.value = "final";
    hostLine.value = "And your final choice is…";

    schedule(() => {
        setSlotRevealed(index, true);
        hostLine.value = "Behold — all is revealed!";
        revealAll();
    }, FINAL_REVEAL_MS);

    schedule(() => {
        phase.value = "done";
        resolveMontyHallFinal(index, layout.value);
    }, FINAL_REVEAL_MS + BEFORE_RESULT_MS);
}

function onStay() {
    if (initialPick.value === null || phase.value !== "decide") return;
    resolveWithFinal(initialPick.value);
}

function onSwitch() {
    if (
        initialPick.value === null ||
        revealedDoor.value === null ||
        phase.value !== "decide"
    ) {
        return;
    }
    resolveWithFinal(switchDoorIndex(initialPick.value, revealedDoor.value));
}

function isPlayerSelected(index: number): boolean {
    if (initialPick.value === null) return false;
    if (finalPick.value !== null) {
        return finalPick.value === index;
    }
    return initialPick.value === index;
}

function slotClasses(index: number): Record<string, boolean> {
    return {
        "monty-hall-tableau__slot--pickable": canPick(index),
        "monty-hall-tableau__slot--selected": isPlayerSelected(index),
        "monty-hall-tableau__slot--revealed-by-host": revealedDoor.value === index,
    };
}

onMounted(() => {
    if (montyMinigame.value) {
        startIntro();
    }
});

onBeforeUnmount(() => {
    clearScheduled();
});
</script>

<template>
    <div v-if="montyMinigame" class="monty-hall-tableau">
        <div class="monty-hall-tableau__host" role="region" aria-label="Goat host">
            <span class="monty-hall-tableau__host-icon" aria-hidden="true">🐐</span>
            <p class="monty-hall-tableau__host-label">Goat Host</p>
            <p class="monty-hall-tableau__host-line">{{ hostLine }}</p>
            <button
                v-if="phase === 'intro'"
                type="button"
                class="monty-hall-tableau__ready"
                @click="beginPicking"
            >
                Start
            </button>
        </div>

        <div
            v-if="phase !== 'intro'"
            class="monty-hall-tableau__track"
            :style="{ width: `${trackWidthPx}px` }"
        >
            <button
                v-for="(slot, index) in slots"
                :key="slot.id"
                type="button"
                class="monty-hall-tableau__slot"
                :class="slotClasses(index)"
                :style="{ transform: slotTransform(index) }"
                :disabled="!canPick(index)"
                @click="onPick(index)"
            >
                <div
                    class="monty-card-flip"
                    :class="{ 'monty-card-flip--face-up': isFaceUp(index) }"
                >
                    <div class="monty-card-flip__inner">
                        <img
                            class="card-back monty-card-flip__back"
                            src="/card_backs/koala.jpg"
                            alt=""
                        />
                        <div class="monty-card-flip__front">
                            <SingleCard
                                :card="slot.spellCard"
                                :display-as-revealed="true"
                            />
                        </div>
                    </div>
                </div>
            </button>
        </div>

        <div v-if="phase === 'decide'" class="monty-hall-tableau__choices">
            <button type="button" class="monty-hall-tableau__choice" @click="onStay">
                Stay
            </button>
            <button type="button" class="monty-hall-tableau__choice" @click="onSwitch">
                Switch
            </button>
        </div>
    </div>
</template>

<style scoped>
.monty-hall-tableau {
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

.monty-hall-tableau__host {
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

.monty-hall-tableau__host-icon {
    font-size: 2.25rem;
    line-height: 1;
}

.monty-hall-tableau__host-label {
    margin: 0;
    font-family: var(--font-game-mono);
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #444;
}

.monty-hall-tableau__host-line {
    margin: 0;
    font-family: var(--font-game-mono);
    font-size: 1rem;
    line-height: 1.45;
    text-align: center;
    color: #333;
}

.monty-hall-tableau__ready,
.monty-hall-tableau__choice {
    margin-top: 4px;
    padding: 10px 18px;
    font-family: var(--font-game-mono);
    font-size: 0.95rem;
    font-weight: 600;
    border-radius: 6px;
    border: 1px solid #888;
    background: #f0f0f0;
    cursor: pointer;
}

.monty-hall-tableau__ready:hover,
.monty-hall-tableau__choice:hover {
    background: #e4e4e4;
}

.monty-hall-tableau__choices {
    display: flex;
    flex-direction: row;
    gap: 12px;
}

.monty-hall-tableau__track {
    position: relative;
    height: 188px;
    flex-shrink: 0;
}

.monty-hall-tableau__slot {
    position: absolute;
    top: 0;
    left: 0;
    padding: 0;
    border: none;
    background: transparent;
    cursor: default;
    transition: transform 0.35s ease, filter 0.2s ease;
    z-index: 1;
}

.monty-hall-tableau__slot--pickable {
    cursor: pointer;
    z-index: 2;
}

.monty-hall-tableau__slot--pickable:hover .monty-card-flip__back {
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.7), 0 0 12px rgba(76, 175, 80, 0.45);
}

.monty-hall-tableau__slot--selected {
    z-index: 3;
}

.monty-hall-tableau__slot--selected .monty-card-flip__back,
.monty-hall-tableau__slot--selected .monty-card-flip__front :deep(.card-view) {
    box-shadow:
        0 0 0 3px #2196f3,
        0 0 18px rgba(33, 150, 243, 0.65);
}

.monty-hall-tableau__slot--revealed-by-host .monty-card-flip__back,
.monty-hall-tableau__slot--revealed-by-host .monty-card-flip__front :deep(.card-view) {
    box-shadow: 0 0 0 2px rgba(120, 120, 120, 0.5);
    opacity: 0.92;
}

.monty-card-flip {
    width: 120px;
    height: 168px;
    perspective: 1000px;
}

.monty-card-flip__inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.45s ease;
    transform: rotateY(0deg);
}

.monty-card-flip--face-up .monty-card-flip__inner {
    transform: rotateY(180deg);
}

.monty-card-flip__back,
.monty-card-flip__front {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    border-radius: 10px;
}

.monty-card-flip__back {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    box-sizing: border-box;
    border: 1px solid #333;
    border-radius: 10px;
    transition: box-shadow 0.2s ease;
}

.monty-card-flip__front :deep(.card-view) {
    transition: box-shadow 0.2s ease;
}

.monty-card-flip__front {
    transform: rotateY(180deg);
}

.monty-card-flip__front :deep(.card-view) {
    margin: 0;
    width: 120px;
    height: 168px;
}

.monty-card-flip__front :deep(.card-view .card-back) {
    display: none;
}
</style>
