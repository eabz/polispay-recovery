import {Coin} from "../coin";

export class Dash implements Coin {
    name = 'Dash (DASH)';
    tag = "dash";
    coinType = 5;
    blockbook = "https://dash1.trezor.io";
    segwitAvailable = false;
    network = {
        messagePrefix: "\x18Dash Signed Message\n",
        bech32: "",
        bip32: {
            public: 0x0488B21E,
            private: 0x0488ADE4,
        },
        pubKeyHash: 76,
        scriptHash: 16,
        wif: 204,
    }
}
