import {Coin} from "../coin";

export class Litecoin implements Coin {
    name = 'Litecoin (LTC)';
    tag = "ltc";
    coinType = 2;
    blockbook = "https://ltc1.trezor.io";
    segwitAvailable = true;
    network = {
        messagePrefix: "\x18Litecoin Signed Message\n",
        bech32: "ltc",
        bip32: {
            public: 0x488b21e,
            private: 0x488ade4,
        },
        pubKeyHash: 48,
        scriptHash: 50,
        wif: 176,
    }
}
