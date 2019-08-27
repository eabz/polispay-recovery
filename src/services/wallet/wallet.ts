import * as bip39 from "bip39"
import {Coin} from "../../models/coin-factory/coin";
import {Wallet} from "../../models/wallet/wallet";
import {bip32, BIP32Interface} from "bitcoinjs-lib";
import {Blockbook} from "../blockbook/blockbook";
import {UtxoResponse} from "../../models/blockbook/blockbook";

export class WalletCreator {

    async createWallet(wallet: Wallet, mnemonic: string, coin: Coin, purpose: number) {
        let rootPriv = await this.rootPrivateKey(mnemonic, coin);
        let account = await this.accountNode(rootPriv, coin, purpose);
        let utxos = await Blockbook.GetUtxosFromXpub(coin, account.neutered().toBase58())
        if (purpose === 44) {
            wallet.P2PKH.AccountPriv = account.toBase58();
            wallet.P2PKH.Utxos = utxos.data;
        }
        if (purpose === 49) {
            wallet.P2SHInP2WPKH.AccountPriv = account.toBase58();
            wallet.P2SHInP2WPKH.Utxos = utxos.data;
        }
        if (purpose === 84) {
            wallet.P2WPKH.AccountPriv = account.toBase58();
            wallet.P2WPKH.Utxos = utxos.data;
        }
    }

    async rootPrivateKey(mnemonic: string, coin: Coin) {
        let seed = await bip39.mnemonicToSeed(mnemonic);
        return bip32.fromSeed(seed, coin.network);
    }

    accountNode(rootPrivKey, coin: Coin, purpose: number): BIP32Interface {
        return rootPrivKey.derivePath("m/" + purpose + "'/" + coin.coinType + "'/" + 0 + "'");
    }

    getPrivateKeyFromUtxo(Utxo: UtxoResponse, Privkey, coin: Coin) {
        let node = bip32.fromBase58(Privkey, coin.network);
        let pathArr = Utxo.path.split("/");
        let child = node.derive(parseInt(pathArr[4])).derive(parseInt(pathArr[5]));
        return child.toWIF();
    }
}
