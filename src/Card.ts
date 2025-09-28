class Card {
    value: number;
    suit: string;
    revealed: boolean = false;

    constructor(value: number, suit: string) {
        this.value = value;
        this.suit = suit;
    }
}

export default Card;
