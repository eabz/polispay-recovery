import {Coin} from "../coin";

export class Polis implements Coin {
    name = 'Polis (POLIS)';
    tag = "polis";
    coinType = 1997;
    blockbook = "https://blockbook.polispay.org";
    segwitAvailable = false;
    network = {
        messagePrefix: "\x18Polis Signed Message\n",
        bech32: "",
        bip32: {
            public: 0x03e25d7e,
            private: 0x03e25945,
        },
        pubKeyHash: 55,
        scriptHash: 56,
        wif: 60,
    }
}
