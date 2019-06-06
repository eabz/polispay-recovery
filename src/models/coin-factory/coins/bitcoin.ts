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
    base58prefixes = {
        Public: 0,
        Script: 5,
        Private: 128,
        ExtPub: 0x0488B21E,
        ExtPriv: 0x0488ADE4,
        Bech32: "bc",
    }
}
