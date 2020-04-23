import {Coin} from "../coin";

export class Aryacoin implements Coin {
    name = 'Aryacoin (AYA)';
    tag = "aya";
    coinType = 0;
    blockbook = "https://aya.polispay.com";
    segwitAvailable = false;
    network = {
        messagePrefix: "\x18Aryacoin Signed Message\n",
        bech32: "",
        bip32: {
            public: 0x0488B21E,
            private: 0x0488ADE4,
        },
        pubKeyHash: 23,
        scriptHash: 5,
        wif: 176,
    }
}
