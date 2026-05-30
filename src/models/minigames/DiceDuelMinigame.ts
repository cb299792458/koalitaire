import Minigame from "../Minigame";

export default class DiceDuelMinigame extends Minigame {
    constructor(act: number) {
        super({
            act,
            name: "Dice Duel",
            description:
                "A cocky gambler at a roadside table challenges you to a dice duel. The winner keeps the pot.",
            options: [
                {
                    stat: "agility",
                    description: "Roll with sleight-of-paw.",
                    success: {
                        effect: (player) => {
                            player.koallarbucks += 75;
                        },
                        message: "You palm a loaded die and win 75 koallarbucks.",
                    },
                    failure: {
                        effect: (player, minigame) => {
                            minigame.damagePlayer(player, 14);
                        },
                        message: "Your die betrays you. You lose the duel and take damage.",
                    },
                },
                {
                    stat: "",
                    description: "Walk away.",
                    failure: {
                        effect: () => {},
                        message: "You decline the duel and continue on your way.",
                    },
                },
            ],
        });
    }
}
