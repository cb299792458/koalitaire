export const suits: string[] = ["♥️",  "🏹", "⛊", "💎", "🗡️",];

class Card {
    rank: number;
    suit: string;
    revealed: boolean = false;

    constructor(rank: number, suit: string) {
        this.rank = rank;
        this.suit = suit;
    }
}

export default Card;

