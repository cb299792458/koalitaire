import Minigame from "../Minigame";

export const MEMORY_MISMATCH_DAMAGE_BASE = 1;

/** The blind elephant who needs help sorting his cards. */
export const ELEPHANT_NAME = "Burton";
export const ELEPHANT_TITLE = "the blind elephant";

export default class MemoryMinigame extends Minigame {
    constructor(act: number) {
        super({
            act,
            name: "Burton's Sort",
            description:
                "Help Burton, the blind elephant, sort his scattered combat cards — eight pairs lie face down and he cannot see them. Flip two at a time to match a pair; each wrong guess deals 1×act damage. Sort every pair to win.",
            options: [],
        });
    }

    mismatchDamage(): number {
        return this.damageForAct(MEMORY_MISMATCH_DAMAGE_BASE);
    }
}
