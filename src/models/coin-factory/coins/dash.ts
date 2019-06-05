import {Coin} from "../coin";

export class Dash implements Coin {
    name = 'Dash (DASH)';
    tag = "dash";
    coinType = 5;
    preferedBackend = "electrumx";
    backendUrl = "https://electrum.polispay.com";
    segwitAvailable = false;
    base58prefixes = {
        Public: 76,
        Script: 16,
        Private: 204,
        ExtPub: 0x0488b21e,
        ExtPriv: 0x88ade4,
    }
}
