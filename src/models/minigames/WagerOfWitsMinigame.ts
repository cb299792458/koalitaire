import Minigame from "../Minigame";

export default class WagerOfWitsMinigame extends Minigame {
    constructor(act: number) {
        super({
            act,
            name: "Wager of Wits",
            description:
                "A scholar offers a riddle contest. Answer correctly and earn coin; answer wrong and pay in blood.",
            options: [
                {
                    stat: "acumen",
                    description: "Solve the riddle about the river that flows uphill.",
                    success: {
                        effect: (player) => {
                            player.koallarbucks += 80;
                        },
                        message: "You explain the tidal bore. The scholar pays you 80 koallarbucks.",
                    },
                    failure: {
                        effect: (player, minigame) => {
                            minigame.damagePlayer(player, 12);
                        },
                        message: "Your guess is nonsense. The scholar's pet eel bites you.",
                    },
                },
                {
                    stat: "",
                    description: "Bluff with a made-up answer.",
                    failure: {
                        effect: (player, minigame) => {
                            minigame.damagePlayer(player, 15);
                        },
                        message: "The scholar sees through you and unleashes a hex. You take heavy damage.",
                    },
                },
            ],
        });
    }
}
