import {Coin} from "../coin";

export class Digibyte implements Coin {
    name = 'DigiByte (DGB)';
    tag = "dgb";
    coinType = 20;
    blockbook = "https://dgb1.trezor.io";
    segwitAvailable = true;
    network = {
        messagePrefix: "\x18Digibyte Signed Message\n",
        bech32: "dgb",
        bip32: {
            public: 0x0488B21E,
            private: 0x0488ADE4,
        },
        pubKeyHash: 30,
        scriptHash: 63,
        wif: 128,
    }
}
