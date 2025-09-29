class Card {
    number: number;
    suit: string;
    revealed: boolean = false;

    constructor(number: number, suit: string) {
        this.number = number;
        this.suit = suit;
    }
}

export default Card;
