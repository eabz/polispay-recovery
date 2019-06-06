export interface Coin {
    name: string;
    tag: string;
    // https://github.com/satoshilabs/slips/blob/master/slip-0044.md
    coinType: number;
    // "insight" for Insight
    // "blockbook" for Trezor Blockbook
    // "electrum" for Electrumx Websocket
    preferedBackend: string;
    backendUrl: string;
    segwitAvailable: boolean;
    base58prefixes: Base58Prefixes;
}

export interface Base58Prefixes {
    Public: number;
    Script: number;
    Private: number;
    ExtPub: number;
    ExtPriv: number;
    Bech32?: string;
}
