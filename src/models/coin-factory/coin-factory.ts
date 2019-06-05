import {Coin} from "./coin";
import {Polis} from "./coins/polis";
import {Dash} from "./coins/dash";

export class CoinFactory {
    static coins: { [name: string]: Coin } = {
        POLIS: new Polis(),
        DASH: new Dash(),
    };

    static coinList: Coin[] = [
        CoinFactory.coins.POLIS,
        CoinFactory.coins.DASH
    ];

    static getCoinConfig(tag: string): Coin {
        tag = tag.toUpperCase();
        return this.coins[tag];
    }

    static getAvailableCoins(): Coin[] {
        return this.coinList;
    }
}
