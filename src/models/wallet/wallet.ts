import {UtxoResponse} from "../blockbook/blockbook";

export interface Wallet {
    P2PKH?: {
        AccountPriv: string;
        Utxos: UtxoResponse[];
    },
    P2WPKH?: {
        AccountPriv: string;
        Utxos: UtxoResponse[];
    },
    P2SHInP2WPKH?: {
        AccountPriv: string;
        Utxos: UtxoResponse[];
    },
    ETH?: {
        AccountPriv: string;
        Utxos: UtxoResponse[];
    },

}
