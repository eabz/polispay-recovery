export interface Coin {
    name: string;
    tag: string;
    // https://github.com/satoshilabs/slips/blob/master/slip-0044.md
    coinType: number;
    // "insight" for Insight
    // "blockbook" for Trezor Blockbook
    // "electrum" for Electrumx Websocket
    preferedBackend: string;
    electrumHost?: ElectrumHost;
    blockbookHost?: string;
    insightHost?: string;
    segwitAvailable: boolean;
    network: NetworkPrefixes;
}

export interface NetworkPrefixes {
    messagePrefix: string;
    bech32: string;
    bip32: Bip32;
    pubKeyHash: number;
    scriptHash: number;
    wif: number;
}

interface Bip32 {
    public: number;
    private: number;
}

export interface ElectrumHost {
    url: string;
    port: string;
}
