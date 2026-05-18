<script setup lang="ts">
    import { ref, watch, onBeforeUnmount, nextTick } from 'vue'
    import CardView from './Cards/SingleCard.vue'
    import type Card from '../models/Card'
    import { combatRef } from '../composables/useCombat'
    import {
        tableauDealState,
        finishTableauDealAnimation,
    } from '../composables/useTableauDealAnimation'

    interface RectCapture {
        left: number
        top: number
        width: number
        height: number
    }

    interface DealFlyer {
        card: Card
        startX: number
        startY: number
        targetX: number
        targetY: number
        x: number
        y: number
        width: number
        height: number
        rotation: number
        flipDeg: number
    }

    const DEAL_MS = 1000
    const FLIP_START = 0.4
    const FLIP_END = 0.9

    const flyers = ref<DealFlyer[]>([])
    const frameTick = ref(0)
    let rafId = 0

    function easeOutCubic(t: number): number {
        return 1 - (1 - t) ** 3
    }

    function flipProgress(globalT: number): number {
        if (globalT <= FLIP_START) return 0
        if (globalT >= FLIP_END) return 1
        return (globalT - FLIP_START) / (FLIP_END - FLIP_START)
    }

    function getDeckFallbackOrigin(): { x: number; y: number } | null {
        const deckWrapper = document.querySelector('.deck-wrapper')
        if (!deckWrapper) return null

        const topCard = deckWrapper.querySelector('.card-view')
        const slot = deckWrapper.querySelector('.card-stack-empty')
        const rect = (topCard ?? slot ?? deckWrapper).getBoundingClientRect()
        if (rect.width < 4 && rect.height < 4) return null

        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        }
    }

    /** Capture each deck card's on-screen rect while the pile is still face down in the deck. */
    function captureDeckStarts(): Map<Card, RectCapture> {
        const combat = combatRef.value
        if (!combat) return new Map()

        const cardEls = document.querySelectorAll('.deck-wrapper .card-view')
        const out = new Map<Card, RectCapture>()
        const cards = combat.deck.cards
        const count = Math.min(cards.length, cardEls.length)

        for (let i = 0; i < count; i++) {
            const el = cardEls[i]
            const card = cards[i]
            const rect = el?.getBoundingClientRect()
            if (!rect || rect.width < 4 || !card) continue
            out.set(card, {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
            })
        }
        return out
    }

    function buildFlyers(deckStarts: Map<Card, RectCapture>): DealFlyer[] {
        const combat = combatRef.value
        if (!combat) return []

        const fallback = getDeckFallbackOrigin()
        const stacks = document.querySelectorAll('.tableau > .card-stack')
        const out: DealFlyer[] = []

        combat.tableau.getColumns().forEach((column, colIdx) => {
            const stack = stacks[colIdx]
            if (!stack) return

            const cardEls = stack.querySelectorAll('.card-view')
            column.cards.forEach((card, cardIdx) => {
                const el = cardEls[cardIdx]
                const targetRect = el?.getBoundingClientRect()
                if (!targetRect || targetRect.width < 4) return

                const deckRect = deckStarts.get(card)
                const width = deckRect?.width ?? targetRect.width
                const height = deckRect?.height ?? targetRect.height
                let startX: number
                let startY: number

                if (deckRect) {
                    startX = deckRect.left
                    startY = deckRect.top
                } else if (fallback) {
                    startX = fallback.x - width / 2
                    startY = fallback.y - height / 2
                } else {
                    startX = targetRect.left
                    startY = targetRect.top
                }

                out.push({
                    card,
                    startX,
                    startY,
                    targetX: targetRect.left,
                    targetY: targetRect.top,
                    x: startX,
                    y: startY,
                    width,
                    height,
                    rotation: 0,
                    flipDeg: 0,
                })
            })
        })

        return out
    }

    function stopLoop() {
        if (rafId) cancelAnimationFrame(rafId)
        rafId = 0
        flyers.value = []
    }

    function flyerStyle(flyer: DealFlyer) {
        return {
            width: `${flyer.width}px`,
            height: `${flyer.height}px`,
            transform: `translate3d(${flyer.x}px, ${flyer.y}px, 0) rotate(${flyer.rotation}deg)`,
        }
    }

    function flipStyle(flyer: DealFlyer) {
        return {
            transform: `rotateY(${flyer.flipDeg}deg)`,
        }
    }

    function showFlyerFront(flyer: DealFlyer): boolean {
        return flyer.flipDeg > 89
    }

    async function startDealAnimation() {
        stopLoop()
        const applyDeal = tableauDealState.applyDeal
        if (!applyDeal) {
            finishTableauDealAnimation()
            return
        }

        await nextTick()
        await new Promise<void>((r) => requestAnimationFrame(() => r()))

        const deckStarts = captureDeckStarts()

        await applyDeal()

        await nextTick()
        await new Promise<void>((r) => requestAnimationFrame(() => r()))

        const dealFlyers = buildFlyers(deckStarts)
        if (dealFlyers.length === 0) {
            finishTableauDealAnimation()
            return
        }

        flyers.value = dealFlyers
        const start = performance.now()

        const tick = (now: number) => {
            const elapsed = now - start
            const globalT = Math.min(1, elapsed / DEAL_MS)
            const eased = easeOutCubic(globalT)
            const flipT = easeOutCubic(flipProgress(globalT))

            for (const f of flyers.value) {
                f.x = f.startX + (f.targetX - f.startX) * eased
                f.y = f.startY + (f.targetY - f.startY) * eased
                f.rotation = (1 - eased) * -8
                f.flipDeg = flipT * 180
            }

            frameTick.value += 1

            if (elapsed < DEAL_MS) {
                rafId = requestAnimationFrame(tick)
            } else {
                stopLoop()
                finishTableauDealAnimation()
            }
        }

        rafId = requestAnimationFrame(tick)
    }

    watch(
        () => tableauDealState.active,
        (active) => {
            if (active) void startDealAnimation()
            else stopLoop()
        },
        { immediate: true }
    )

    onBeforeUnmount(stopLoop)
</script>

<template>
    <Teleport to="body">
        <div
            v-if="tableauDealState.active && flyers.length > 0"
            class="tableau-deal-layer"
            :data-frame="frameTick"
            aria-hidden="true"
        >
            <div
                v-for="(flyer, index) in flyers"
                :key="index"
                class="tableau-deal-card"
                :style="flyerStyle(flyer)"
            >
                <div class="tableau-deal-flip" :style="flipStyle(flyer)">
                    <img
                        class="tableau-deal-face tableau-deal-face--back"
                        src="/card_backs/koala.jpg"
                        alt=""
                    />
                    <div
                        v-show="showFlyerFront(flyer)"
                        class="tableau-deal-face tableau-deal-face--front"
                    >
                        <CardView :card="flyer.card" display-as-revealed />
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
    .tableau-deal-layer {
        position: fixed;
        inset: 0;
        z-index: 10040;
        pointer-events: none;
        overflow: hidden;
    }

    .tableau-deal-card {
        position: fixed;
        top: 0;
        left: 0;
        transform-origin: center center;
        will-change: transform;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
        perspective: 900px;
    }

    .tableau-deal-flip {
        position: relative;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        will-change: transform;
    }

    .tableau-deal-face {
        position: absolute;
        inset: 0;
        backface-visibility: hidden;
        border-radius: 10px;
        overflow: hidden;
    }

    .tableau-deal-face--back {
        transform: rotateY(0deg);
        object-fit: cover;
        width: 100%;
        height: 100%;
        border: 5px solid white;
        box-sizing: border-box;
        background: #1a3d2e;
    }

    .tableau-deal-face--front {
        transform: rotateY(180deg);
    }

    .tableau-deal-card :deep(.card-view) {
        margin: 0;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none;
    }
</style>
