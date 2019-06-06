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
    RootPriv: string;
    AccountPub: string;
    AccountPriv: string;
}

export interface Address {
    scripthash: string;
    address: string;
    purpose: number;
    derivationPath: number;
    type: string;
}
