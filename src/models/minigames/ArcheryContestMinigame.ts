import Minigame from "../Minigame";

export default class ArcheryContestMinigame extends Minigame {
    constructor(act: number) {
        super({
            act,
            name: "Archery Contest",
            description:
                "Villagers have set up an archery contest at the fair. Hit the bullseye and they will cheer you on with a reward.",
            options: [
                {
                    stat: "attack",
                    description: "Take the longbow and aim for the bullseye.",
                    success: {
                        effect: (player) => {
                            player.koallarbucks += 60;
                        },
                        message: "Bullseye! The crowd tosses 60 koallarbucks into your hat.",
                    },
                    failure: {
                        effect: (player, minigame) => {
                            minigame.damagePlayer(player, 8);
                        },
                        message: "The bowstring snaps back and bruises you. You take damage.",
                    },
                },
                {
                    stat: "appeal",
                    description: "Talk the judge into a closer target.",
                    success: {
                        effect: (player) => {
                            player.koallarbucks += 40;
                        },
                        message: "They move the target closer. You win 40 koallarbucks anyway.",
                    },
                    failure: {
                        effect: (player, minigame) => {
                            minigame.damagePlayer(player, 6);
                        },
                        message: "The judge is offended and pelts you with fruit. You take damage.",
                    },
                },
            ],
        });
    }
}
