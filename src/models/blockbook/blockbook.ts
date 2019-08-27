export interface UtxoResponse {
    txid: string;
    vout: number;
    value: string;
    height: number;
    confirmations: number;
    address: string;
    path: string;
}

