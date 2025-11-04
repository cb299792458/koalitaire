import type { CardParams } from "../../models/Card";

function makeDefaultCards(ranks: number[], suits: string[]): CardParams[] {
    return ranks.flatMap(rank =>
        suits.map(suit => ({
            rank,
            suit,
        }))
    );
}


const koaDeck: CardParams[] = [
    {
        rank: 1, suit: "♥️", name: "Strong Strike", description: "Deal damage equal to your attack.",
        effect: (player, enemy) => enemy.takeDamage(player.attack)
    },
    {
        rank: 2, suit: "♥️", name: "Melee Strike", description: "Deal 2 damage to an enemy.", 
        effect: (_player, enemy) => enemy.takeDamage(2)
    },
    {
        rank: 3, suit: "♥️", name: "Divination", description: "Draw 2 cards",
        effect: (_player, _enemy, gameState) => gameState.drawCards(2, true)
    },
    {
        rank: 4, suit: "♥️", name: "Bow Shot", description: "Deal 4 damage to an enemy.",
        effect: (_player, enemy) => enemy.takeDamage(4)
    },
    {
        rank: 5, suit: "♥️", name: "Shield Bash", description: "Deal 5 damage to an enemy and gain 2 block.",
        effect: (player, enemy) => {
            enemy.takeDamage(5);
            player.block += 2;
        }
    },
    {
        rank: 6, suit: "♥️", name: "Full heal", description: "Fully heal yourself.",
        effect: (player) => player.health = player.maxHealth
    },
    {
        rank: 7, suit: "♥️", name: "Wheel", description: "Discard your hand and draw 7 cards.",
        effect: (_player, _enemy, gameState) => gameState.drawCards(7, false)
    },
    ...makeDefaultCards([1, 2, 3, 4, 5, 6, 7], ["🌳", "🪧", "⛊", "💎"]),
]

export default koaDeck;
