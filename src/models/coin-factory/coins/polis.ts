import {Coin} from "../coin";

export class Polis implements Coin {
    name = 'Polis (POLIS)';
    tag = "polis";
    coinType = 1997;
    preferedBackend = "electrumx";
    backendUrl = "https://electrum.polispay.com";
    segwitAvailable = false;
    base58prefixes = {
        Public: 55,
        Script: 56,
        Private: 60,
        ExtPub: 0x03e25d7e,
        ExtPriv: 0x03e25945,
    }
}
