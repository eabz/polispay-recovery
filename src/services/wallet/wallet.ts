import * as bip39 from "bip39"
import * as bitcoin from 'bitcoinjs-lib';
import {Coin} from "../../models/coin-factory/coin";
import {Address, Wallet} from "../../models/wallet/wallet";
import {createHash} from "crypto";
import {Electrum} from "../electrumx/electrum";
import {bip32, BIP32Interface} from "bitcoinjs-lib";

export class WalletCreator {

    async createWallet(wallet: Wallet, mnemonic: string, coin: Coin, purpose: number) {
        let ScanRounds = 500; // 500 * 20 a maximum of 10000 address can be scanned if needed
        // Create HD wallets
        if (purpose === 44) {
            let rootPriv = await this.rootPrivateKey(mnemonic, coin);
            let account = await this.accountNode(rootPriv, coin, purpose);
            wallet.P2PKH.AccountPub = account.neutered().toBase58();
            wallet.P2PKH.AccountPriv = account.toBase58();

            // Scan for addresses history
            for (let i = 0; i < ScanRounds; i ++) {
                let address = await this.addresses(account, coin, purpose, true, i);
                let addrHistory = await Electrum.prototype.getAddrHistory(address, coin);
                if (addrHistory.length === 0) break;
                let PathsDirect = this._getDirectPathsFromTxHistory(addrHistory);
                let PathsChange = this._getChangePathsFromTxHistory(addrHistory);
                if (PathsDirect.length > 0) wallet.P2PKH.LastPathDirect = Math.max(...PathsDirect);
                if (PathsChange.length > 0) wallet.P2PKH.LastPathChange = Math.max(...PathsChange);
            }

            // Get address array from Last used + gap
            let gapTop = wallet.P2PKH.LastPathDirect > wallet.P2PKH.LastPathChange ? wallet.P2PKH.LastPathDirect : wallet.P2PKH.LastPathChange
            wallet.P2PKH.Address = await this.addresses(account, coin, purpose, false, null, gapTop);

            // Get Utxos from Address Array
            wallet.P2PKH.Utxos = await Electrum.prototype.getAddrUtxos(wallet.P2PKH.Address, coin);
        }
        if (purpose === 49) {
            let rootPriv = await this.rootPrivateKey(mnemonic, coin);
            let account = await this.accountNode(rootPriv, coin, purpose);
            wallet.P2SHInP2WPKH.AccountPub = account.neutered().toBase58();
            wallet.P2SHInP2WPKH.AccountPriv = account.toBase58();
            // Scan for addresses history
            for (let i = 0; i < ScanRounds; i ++) {
                let address = await this.addresses(account, coin, purpose, true, i);
                let addrHistory = await Electrum.prototype.getAddrHistory(address, coin);
                if (addrHistory.length === 0) break;
                let PathsDirect = this._getDirectPathsFromTxHistory(addrHistory);
                let PathsChange = this._getChangePathsFromTxHistory(addrHistory);
                if (PathsDirect.length > 0) wallet.P2SHInP2WPKH.LastPathDirect = Math.max(...PathsDirect);
                if (PathsChange.length > 0) wallet.P2SHInP2WPKH.LastPathChange = Math.max(...PathsChange);
            }

            // Get address array from Last used + gap
            let gapTop = wallet.P2SHInP2WPKH.LastPathDirect > wallet.P2SHInP2WPKH.LastPathChange ? wallet.P2SHInP2WPKH.LastPathDirect : wallet.P2SHInP2WPKH.LastPathChange
            wallet.P2SHInP2WPKH.Address = await this.addresses(account, coin, purpose, false, null, gapTop)

            // Get Utxos from Address Array
            wallet.P2SHInP2WPKH.Utxos = await Electrum.prototype.getAddrUtxos(wallet.P2SHInP2WPKH.Address, coin);

        }
        if (purpose === 84) {
            let rootPriv = await this.rootPrivateKey(mnemonic, coin);
            let account = await this.accountNode(rootPriv, coin, purpose);
            wallet.P2WPKH.AccountPub = account.neutered().toBase58();
            wallet.P2WPKH.AccountPriv = account.toBase58();
            // Scan for addresses history
            for (let i = 0; i < ScanRounds; i ++) {
                let address = await this.addresses(account, coin, purpose, true, i);
                let addrHistory = await Electrum.prototype.getAddrHistory(address, coin);
                if (addrHistory.length === 0) break;
                let PathsDirect = this._getDirectPathsFromTxHistory(addrHistory);
                let PathsChange = this._getChangePathsFromTxHistory(addrHistory);
                if (PathsDirect.length > 0) wallet.P2WPKH.LastPathDirect = Math.max(...PathsDirect);
                if (PathsChange.length > 0) wallet.P2WPKH.LastPathChange = Math.max(...PathsChange);
            }

            // Get address array from Last used + gap
            let gapTop = wallet.P2WPKH.LastPathDirect > wallet.P2WPKH.LastPathChange ? wallet.P2WPKH.LastPathDirect : wallet.P2WPKH.LastPathChange;
            wallet.P2WPKH.Address = await this.addresses(account, coin, purpose, false, null, gapTop)

            // Get Utxos from Address Array
            wallet.P2WPKH.Utxos = await Electrum.prototype.getAddrUtxos(wallet.P2WPKH.Address, coin);

        }
    }

    async rootPrivateKey(mnemonic: string, coin: Coin) {
        let seed = await bip39.mnemonicToSeed(mnemonic);
        return bip32.fromSeed(seed, coin.network);
    }

    accountNode(rootPrivKey, coin: Coin, purpose: number): BIP32Interface {
        return rootPrivKey.derivePath("m/" + purpose + "'/" + coin.coinType + "'/" + 0 + "'");
    }

    async addresses(account: BIP32Interface, coin: Coin, purpose: number, scan: boolean, round: number, gapTop?: number): Promise<Address[]> {
        let AddressesArray: Address[] = [];
        let GapBottom = scan ? 20 * round : 0;
        let GapTop = scan ? 20 * round + 20 : gapTop + 20;
        for (let i = GapBottom; i < GapTop; i++) {
            let derivationDirect = account.derive(0).derive(i);
            let derivationChange = account.derive(1).derive(i);

            let addressDirect;
            let addressChange;
            if (purpose === 44) {
                addressDirect = bitcoin.payments.p2pkh({ pubkey: derivationDirect.publicKey, network: coin.network });
                addressChange = bitcoin.payments.p2pkh({ pubkey: derivationChange.publicKey, network: coin.network });
            }
            if (purpose === 49) {
                addressDirect = bitcoin.payments.p2sh({ redeem: bitcoin.payments.p2wpkh({ pubkey: derivationDirect.publicKey, network: coin.network })});
                addressChange = bitcoin.payments.p2sh({ redeem: bitcoin.payments.p2wpkh({ pubkey: derivationChange.publicKey, network: coin.network })});
            }
            if (purpose === 84) {
                addressDirect = bitcoin.payments.p2wpkh({ pubkey: derivationDirect.publicKey, network: coin.network });
                addressChange = bitcoin.payments.p2wpkh({ pubkey: derivationDirect.publicKey, network: coin.network });
            }

            let hashChange = createHash('sha256').update(addressChange.output).digest();
            let swapChange = this.changeEndianness(hashChange.toString('hex'));

            let hashDirect = createHash('sha256').update(addressDirect.output).digest();
            let swapDirect = this.changeEndianness(hashDirect.toString('hex'));

            AddressesArray.push({address: addressDirect.address, path: i, purpose: purpose,  scripthash: swapDirect, type: "direct"});
            AddressesArray.push({address: addressChange.address, path: i, purpose: purpose,  scripthash: swapChange, type: "change"})

        }
        return AddressesArray
    }

    getPublicKeyFromUtxo(Utxo, Pubkey, coin: Coin) {
        let pubKey;
        let node = bip32.fromBase58(Pubkey, coin.network);
        let external = Utxo.type === "direct" ? 0 : 1;
        let child = node.derive(external).derive(Utxo.path);
        if (Utxo.purpose === 44) {
            pubKey = bitcoin.payments.p2pkh({ pubkey: child.publicKey, network: coin.network }).address;
        }
        if (Utxo.purpose === 49) {
            pubKey = bitcoin.payments.p2sh({ redeem: bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network: coin.network })}).address;
        }
        if (Utxo.purpose === 84) {
            pubKey = bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network: coin.network }).address;
        }
        return pubKey;
    }

    getPrivateKeyFromUtxo(Utxo, Privkey, coin: Coin) {
        let node = bip32.fromBase58(Privkey, coin.network);
        let external = Utxo.type === "direct" ? 0 : 1;
        let child = node.derive(external).derive(Utxo.path);
        return child.toWIF();
    }

    changeEndianness(string) {
        const result = [];
        let len = string.length - 2;
        while (len >= 0) {
            result.push(string.substr(len, 2));
            len -= 2;
        }
        return result.join('');
    };

    private _getDirectPathsFromTxHistory(txHistory: any[]): any[] {
        let txHistoryLength = txHistory.length;
        let PathsDirect = [];
        for (let i = 0; i < txHistoryLength; i++) {
            if (txHistory[i].addrType === "direct") {
                PathsDirect.push(txHistory[i].path)
            }
        }
        return PathsDirect
    }

    private _getChangePathsFromTxHistory(txHistory: any[]): any[] {
        let txHistoryLength = txHistory.length;
        let PathsChange = [];
        for (let i = 0; i < txHistoryLength; i++) {
            if (txHistory[i].addrType === "change") {
                PathsChange.push(txHistory[i].path)
            }
        }
        return PathsChange
    }
}
