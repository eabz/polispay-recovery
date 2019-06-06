import {Coin} from "../coin";

export class Bitcoin implements Coin {
    name = 'Bitcoin (BTC)';
    tag = "btc";
    coinType = 0;
    preferedBackend = "electrumx";
    electrumHost = {
        url: "electrum.polispay.com",
        port: "52001"
    };
    segwitAvailable = true;
    network = {
        messagePrefix: "\x18Bitcoin Signed Message\n",
        bech32: "bc",
        bip32: {
            public: 0x0488B21E,
            private: 0x0488ADE4,
        },
        pubKeyHash: 0,
        scriptHash: 5,
        wif: 128,
    }
}
