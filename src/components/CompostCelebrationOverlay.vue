<script setup lang="ts">
    import { ref, watch, onBeforeUnmount, nextTick } from 'vue'
    import CardView from './Cards/SingleCard.vue'
    import type Card from '../models/Card'
    import { combatRef } from '../composables/useCombat'
    import {
        compostCelebrationState,
        finishManaPoolCelebration,
        type CompostCelebrationPhase,
    } from '../composables/useCompostCelebration'

    interface BounceFlyer {
        kind: 'bounce'
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

    interface SnakeFlyer {
        kind: 'snake'
        card: Card
        startX: number
        startY: number
        x: number
        y: number
        width: number
        height: number
        rotation: number
        trailOffset: number
    }

    type Flyer = BounceFlyer | SnakeFlyer

    const GRAVITY = 0.42
    const WALL_DAMPING = 0.78
    const BOUNCE_MS = 3800
    const SNAKE_MS = 3400
    const SNAKE_TURNS = 2.75

    const flyers = ref<Flyer[]>([])
    const frameTick = ref(0)
    let rafId = 0

    function easeOutCubic(t: number): number {
        return 1 - (1 - t) ** 3
    }

    function captureManaPoolFlyers(): BounceFlyer[] {
        const combat = combatRef.value
        if (!combat) return []

        const cardQueue: Card[] = []
        for (const pool of combat.manaPools.pools()) {
            for (const card of pool.cards) {
                cardQueue.push(card)
            }
        }

        const stacks = document.querySelectorAll('.mana-pools .card-stack.mana-pool-stack')
        const out: BounceFlyer[] = []
        let cardIdx = 0

        stacks.forEach((stack) => {
            stack.querySelectorAll('.card-view').forEach((el) => {
                const rect = el.getBoundingClientRect()
                if (rect.width < 4) return
                const card = cardQueue[cardIdx]
                cardIdx += 1
                if (!card) return
                out.push({
                    kind: 'bounce',
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

    function captureCompostFlyers(): SnakeFlyer[] {
        const combat = combatRef.value
        if (!combat) return []

        const spellCards = combat.compost.cards.filter((c) => c.isSpell)
        const pile = document.querySelector('.compost-wrapper .card-stack')
        if (!pile) return []

        const cardEls = pile.querySelectorAll('.card-view')
        const out: SnakeFlyer[] = []
        const count = Math.min(spellCards.length, cardEls.length)

        for (let i = 0; i < count; i++) {
            const el = cardEls[i]
            const rect = el?.getBoundingClientRect()
            const card = spellCards[i]
            if (!rect || rect.width < 4 || !card) continue
            out.push({
                kind: 'snake',
                card,
                startX: rect.left,
                startY: rect.top,
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
                rotation: 0,
                trailOffset: count <= 1 ? 0 : i / (count - 1),
            })
        }
        return out
    }

    function tickBouncePhysics() {
        const maxX = window.innerWidth
        const maxY = window.innerHeight
        for (const f of flyers.value) {
            if (f.kind !== 'bounce') continue
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
    }

    function snakeTarget(globalT: number, trailOffset: number, width: number, height: number) {
        const lagged = Math.max(0, Math.min(1, globalT - trailOffset * 0.22))
        const cx = window.innerWidth / 2
        const cy = window.innerHeight / 2
        const angle = lagged * SNAKE_TURNS * Math.PI * 2 - Math.PI / 2
        const radius = 70 + (1 - lagged) * 260
        return {
            x: cx + Math.cos(angle) * radius - width / 2,
            y: cy + Math.sin(angle) * radius - height / 2,
            rotation: (angle * 180) / Math.PI + 90,
        }
    }

    function tickSnakePositions(globalT: number) {
        const blendIn = easeOutCubic(Math.min(1, globalT / 0.2))
        for (const f of flyers.value) {
            if (f.kind !== 'snake') continue
            const target = snakeTarget(globalT, f.trailOffset, f.width, f.height)
            f.x = f.startX + (target.x - f.startX) * blendIn
            f.y = f.startY + (target.y - f.startY) * blendIn
            f.rotation = target.rotation * blendIn
        }
    }

    function celebrationPhase(hasBounce: boolean, hasSnake: boolean): CompostCelebrationPhase {
        if (hasBounce && hasSnake) return 'both'
        if (hasBounce) return 'mana-bounce'
        return 'compost-snake'
    }

    function stopLoop() {
        if (rafId) cancelAnimationFrame(rafId)
        rafId = 0
        flyers.value = []
    }

    function flyerStyle(flyer: Flyer) {
        return {
            width: `${flyer.width}px`,
            height: `${flyer.height}px`,
            transform: `translate3d(${flyer.x}px, ${flyer.y}px, 0) rotate(${flyer.rotation}deg)`,
        }
    }

    async function startCelebration() {
        stopLoop()
        await nextTick()
        await new Promise<void>((r) => requestAnimationFrame(() => r()))

        const bounceFlyers = captureManaPoolFlyers()
        const snakeFlyers = captureCompostFlyers()
        const hasBounce = bounceFlyers.length > 0
        const hasSnake = snakeFlyers.length > 0

        if (!hasBounce && !hasSnake) {
            finishManaPoolCelebration()
            return
        }

        compostCelebrationState.phase = celebrationPhase(hasBounce, hasSnake)
        flyers.value = [...bounceFlyers, ...snakeFlyers]

        const durationMs = Math.max(hasBounce ? BOUNCE_MS : 0, hasSnake ? SNAKE_MS : 0)
        const start = performance.now()

        const tick = (now: number) => {
            const elapsed = now - start

            if (hasBounce && elapsed < BOUNCE_MS) {
                tickBouncePhysics()
            }
            if (hasSnake) {
                tickSnakePositions(Math.min(1, elapsed / SNAKE_MS))
            }

            frameTick.value += 1

            if (elapsed < durationMs) {
                rafId = requestAnimationFrame(tick)
            } else {
                stopLoop()
                finishManaPoolCelebration()
            }
        }

        rafId = requestAnimationFrame(tick)
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
                :class="{ 'compost-celebration-card--snake': flyer.kind === 'snake' }"
                :style="flyerStyle(flyer)"
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

    .compost-celebration-card--snake {
        filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.35));
    }

    .compost-celebration-card :deep(.card-view) {
        margin: 0;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none;
    }
</style>
