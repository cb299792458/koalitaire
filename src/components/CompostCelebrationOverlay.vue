<script setup lang="ts">
    import { ref, watch, onBeforeUnmount, nextTick } from 'vue'
    import CardView from './Cards/SingleCard.vue'
    import type Card from '../models/Card'
    import { combatRef } from '../composables/useCombat'
    import {
        compostCelebrationState,
        finishManaPoolCelebration,
    } from '../composables/useCompostCelebration'

    interface Flyer {
        card: Card
        x: number
        y: number
        vx: number
        vy: number
        width: number
        height: number
        rotation: number
        spin: number
    }

    const GRAVITY = 0.42
    const WALL_DAMPING = 0.78
    const CELEBRATION_MS = 3800

    const flyers = ref<Flyer[]>([])
    /** Bumped each frame so flyer transforms re-render during physics. */
    const frameTick = ref(0)
    let rafId = 0
    let endTimer: ReturnType<typeof setTimeout> | null = null

    function captureManaPoolFlyers(): Flyer[] {
        const combat = combatRef.value
        if (!combat) return []

        const cardQueue: Card[] = []
        for (const pool of combat.manaPools.pools()) {
            for (const card of pool.cards) {
                cardQueue.push(card)
            }
        }

        const stacks = document.querySelectorAll('.mana-pools .card-stack.mana-pool-stack')
        const out: Flyer[] = []
        let cardIdx = 0

        stacks.forEach((stack) => {
            const cardEls = stack.querySelectorAll('.card-view')
            cardEls.forEach((el) => {
                const rect = el.getBoundingClientRect()
                if (rect.width < 4) return
                const card = cardQueue[cardIdx]
                cardIdx += 1
                if (!card) return
                out.push({
                    card,
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height,
                    vx: (Math.random() - 0.5) * 14,
                    vy: -6 - Math.random() * 10,
                    rotation: (Math.random() - 0.5) * 50,
                    spin: (Math.random() - 0.5) * 10,
                })
            })
        })
        return out
    }

    function tickFlyers() {
        const maxX = window.innerWidth
        const maxY = window.innerHeight
        for (const f of flyers.value) {
            f.vy += GRAVITY
            f.x += f.vx
            f.y += f.vy
            f.rotation += f.spin

            if (f.x <= 0) {
                f.x = 0
                f.vx = Math.abs(f.vx) * WALL_DAMPING
            } else if (f.x + f.width >= maxX) {
                f.x = maxX - f.width
                f.vx = -Math.abs(f.vx) * WALL_DAMPING
            }
            if (f.y <= 0) {
                f.y = 0
                f.vy = Math.abs(f.vy) * WALL_DAMPING
            } else if (f.y + f.height >= maxY) {
                f.y = maxY - f.height
                f.vy = -Math.abs(f.vy) * WALL_DAMPING
            }
        }
        frameTick.value += 1
        rafId = requestAnimationFrame(tickFlyers)
    }

    function stopLoop() {
        if (rafId) cancelAnimationFrame(rafId)
        rafId = 0
        if (endTimer) clearTimeout(endTimer)
        endTimer = null
        flyers.value = []
    }

    async function startCelebration() {
        stopLoop()
        await nextTick()
        await new Promise<void>((r) => requestAnimationFrame(() => r()))

        flyers.value = captureManaPoolFlyers()
        if (flyers.value.length === 0) {
            finishManaPoolCelebration()
            return
        }

        rafId = requestAnimationFrame(tickFlyers)
        endTimer = setTimeout(() => {
            stopLoop()
            finishManaPoolCelebration()
        }, CELEBRATION_MS)
    }

    watch(
        () => compostCelebrationState.active,
        (active) => {
            if (active) void startCelebration()
            else stopLoop()
        },
        { immediate: true }
    )

    onBeforeUnmount(stopLoop)
</script>

<template>
    <Teleport to="body">
        <div
            v-if="compostCelebrationState.active && flyers.length > 0"
            class="compost-celebration-layer"
            :data-frame="frameTick"
            aria-hidden="true"
        >
            <div
                v-for="(flyer, index) in flyers"
                :key="index"
                class="compost-celebration-card"
                :style="{
                    width: `${flyer.width}px`,
                    height: `${flyer.height}px`,
                    transform: `translate3d(${flyer.x}px, ${flyer.y}px, 0) rotate(${flyer.rotation}deg)`,
                }"
            >
                <CardView :card="flyer.card" />
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
    .compost-celebration-layer {
        position: fixed;
        inset: 0;
        z-index: 10050;
        pointer-events: none;
        overflow: hidden;
    }

    .compost-celebration-card {
        position: fixed;
        top: 0;
        left: 0;
        transform-origin: center center;
        will-change: transform;
    }

    .compost-celebration-card :deep(.card-view) {
        margin: 0;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none;
    }
</style>
