import {Coin} from "../coin";

export class Dash implements Coin {
    name = 'Dash (DASH)';
    tag = "dash";
    coinType = 5;
    preferedBackend = "electrumx";
    electrumHost = {
        url: "electrum.polispay.com",
        port: "52003"
    };
    segwitAvailable = false;
    base58prefixes = {
        Public: 76,
        Script: 16,
        Private: 204,
        ExtPub: 0x0488B21E,
        ExtPriv: 0x0488ADE4,
    }
}
