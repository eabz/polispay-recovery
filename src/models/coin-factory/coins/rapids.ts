import {Coin} from "../coin";

export class Rapids implements Coin {
    name = 'Rapids (RPD)';
    tag = "rpd";
    coinType = 0;
    blockbook = "https://rpd.polispay.com";
    segwitAvailable = false;
    network = {
        messagePrefix: "\x18Rapids Signed Message\n",
        bech32: "",
        bip32: {
            public: 0x488b21e,
            private: 0x488ade4,
        },
        pubKeyHash: 61,
        scriptHash: 6,
        wif: 46,
    }
}
