import {Coin} from "../../models/coin-factory/coin";
import axios, {AxiosResponse} from 'axios'
import {UtxoResponse} from "../../models/blockbook/blockbook";

export class Blockbook {

    static async GetUtxosFromXpub(coin: Coin, xpub: string): Promise<AxiosResponse<UtxoResponse[]>> {
      return await axios.get<UtxoResponse[]>(coin.blockbook + "/api/v2/utxo/" + xpub);
    }


}
