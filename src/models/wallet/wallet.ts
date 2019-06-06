export interface Network {
    wif: number;
    bip32: {
        public: number;
        private: number;
    };
    messagePrefix?: string;
    bech32?: string;
    pubKeyHash?: number;
    scriptHash?: number;
}

export interface Wallet {
    P2PKH?: {
        AccountPub: string;
        AccountPriv: string;
        Address: Address[];
        LastPathDirect: number;
        LastPathChange: number;
        Utxos: [];

    },
    P2WPKH?: {
        AccountPub: string;
        AccountPriv: string;
        Address: Address[];
        LastPathDirect: number;
        LastPathChange: number;
        Utxos: [];
    },
    P2SHInP2WPKH?: {
        AccountPub: string;
        AccountPriv: string;
        Address: Address[];
        LastPathDirect: number;
        LastPathChange: number;
        Utxos: [];
    },
    ETH?: {
        AccountPub: string;
        AccountPriv: string;
        Address: Address[];
        LastPathDirect: number;
        LastPathChange: number;
        Utxos: [];
    },

}

export interface Address {
    scripthash: string;
    address: string;
    purpose: number;
    path: string;
    type: string;
}
