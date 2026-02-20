import { ref, type Ref } from 'vue';
import type Player from '../models/Player';
import type { Event, EventOption } from '../models/Event';

const playerRef = ref<Player | null>(null);
const currentEventRef = ref<Event | null>(null);
const isInEventRef = ref(false);
const lastPlayerRollRef = ref<number | null>(null);
const lastEventRollRef = ref<number | null>(null);
const lastStatBonusRef = ref<number | null>(null);
const lastStatRef = ref<string | null>(null);
const resultMessageRef = ref<string | null>(null);
const isResolvingRef = ref(false);

let onLeaveEventCallback: (() => void) | undefined;

function rollD20(): number {
    return Math.floor(Math.random() * 20) + 1;
}

function getPlayerStat(player: Player, stat: EventOption['stat']): number {
    if (!stat) return 0;
    const key = stat as keyof Player;
    const val = player[key];
    return typeof val === 'number' ? val : 0;
}

export function useEvent(): {
    player: Ref<Player | null>;
    currentEvent: Ref<Event | null>;
    isInEvent: Ref<boolean>;
    lastPlayerRoll: Ref<number | null>;
    lastEventRoll: Ref<number | null>;
    lastStatBonus: Ref<number | null>;
    lastStat: Ref<string | null>;
    resultMessage: Ref<string | null>;
    isResolving: Ref<boolean>;
    resetEventState: () => void;
    resolveChoice: (option: EventOption) => void;
    onEventContinue: () => void;
    choiceLabel: (option: EventOption) => string;
    enterEvent: (player: Player, event: Event) => void;
    leaveEvent: () => void;
    onLeaveEvent: (fn: () => void) => void;
} {
    return {
        player: playerRef as Ref<Player | null>,
        currentEvent: currentEventRef,
        isInEvent: isInEventRef,
        lastPlayerRoll: lastPlayerRollRef,
        lastEventRoll: lastEventRollRef,
        lastStatBonus: lastStatBonusRef,
        lastStat: lastStatRef,
        resultMessage: resultMessageRef,
        isResolving: isResolvingRef,
        resetEventState() {
            isInEventRef.value = false;
            currentEventRef.value = null;
            playerRef.value = null;
            lastPlayerRollRef.value = null;
            lastEventRollRef.value = null;
            lastStatBonusRef.value = null;
            lastStatRef.value = null;
            resultMessageRef.value = null;
            isResolvingRef.value = false;
        },
        resolveChoice(option: EventOption) {
            const p = playerRef.value;
            if (!p || isResolvingRef.value) return;

            isResolvingRef.value = true;
            resultMessageRef.value = null;

            const hasSuccess = !!option.success;
            const hasFailure = !!option.failure;

            if (hasSuccess && !hasFailure) {
                option.success!.effect(p as Player);
                resultMessageRef.value = option.success!.message;
            } else if (hasFailure && !hasSuccess) {
                option.failure!.effect(p as Player);
                resultMessageRef.value = option.failure!.message;
            } else if (hasSuccess && hasFailure) {
                const playerRoll = rollD20();
                const eventRoll = rollD20();
                const statBonus = option.stat ? getPlayerStat(p as Player, option.stat) : 0;
                const playerTotal = playerRoll + statBonus;

                lastPlayerRollRef.value = playerRoll;
                lastEventRollRef.value = eventRoll;
                lastStatBonusRef.value = option.stat ? statBonus : null;
                lastStatRef.value = option.stat || null;

                if (playerTotal > eventRoll) {
                    option.success!.effect(p as Player);
                    resultMessageRef.value = option.success!.message;
                } else {
                    option.failure!.effect(p as Player);
                    resultMessageRef.value = option.failure!.message;
                }
            }

            isResolvingRef.value = false;
        },
        onEventContinue() {
            resultMessageRef.value = null;
            isInEventRef.value = false;
            currentEventRef.value = null;
            lastPlayerRollRef.value = null;
            lastEventRollRef.value = null;
            lastStatBonusRef.value = null;
            lastStatRef.value = null;
            onLeaveEventCallback?.();
        },
        choiceLabel(option: EventOption) {
            if (option.stat) {
                return `${option.description} (${option.stat})`;
            }
            return option.description;
        },
        enterEvent(player: Player, event: Event) {
            playerRef.value = player;
            currentEventRef.value = event;
            isInEventRef.value = true;
            resultMessageRef.value = null;
            isResolvingRef.value = false;
            lastPlayerRollRef.value = null;
            lastEventRollRef.value = null;
            lastStatBonusRef.value = null;
            lastStatRef.value = null;
        },
        leaveEvent() {
            resultMessageRef.value = null;
            isResolvingRef.value = false;
            isInEventRef.value = false;
            currentEventRef.value = null;
            lastPlayerRollRef.value = null;
            lastEventRollRef.value = null;
            lastStatBonusRef.value = null;
            lastStatRef.value = null;
            onLeaveEventCallback?.();
        },
        onLeaveEvent(fn: () => void) {
            onLeaveEventCallback = fn;
        },
    };
}
