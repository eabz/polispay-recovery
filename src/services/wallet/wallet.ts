import * as bip39 from "bip39"
import * as bitcoin from 'bitcoinjs-lib';
import * as hdkey from "hdkey"
import {Coin} from "../../models/coin-factory/coin";
import {Address, Network, Wallet} from "../../models/wallet/wallet";
import {createHash} from "crypto";
import {Electrum} from "../electrumx/electrum";

export class WalletCreator {

    async createWallet(wallet: Wallet, mnemonic: string, coin: Coin, purpose: number) {
        let ScanRounds = 500; // 500 * 20 a maximum of 10000 address can be scanned if needed
        // Create HD wallets
        if (purpose === 44) {
            let rootPriv = await this.rootPrivateKey(mnemonic, coin);
            let account = await this.accountNode(rootPriv, coin, purpose);
            wallet.P2PKH.AccountPub = account.toJSON().xpub;
            wallet.P2PKH.AccountPriv = account.toJSON().xpriv;

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
            wallet.P2PKH.Address = await this.addresses(account, coin, purpose, false, null, gapTop)
        }
        if (purpose === 49) {
            let rootPriv = await this.rootPrivateKey(mnemonic, coin);
            let account = await this.accountNode(rootPriv, coin, purpose);
            wallet.P2SHInP2WPKH.AccountPub = account.toJSON().xpub;
            wallet.P2SHInP2WPKH.AccountPriv = account.toJSON().xpriv;
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

        }
        if (purpose === 84) {
            let rootPriv = await this.rootPrivateKey(mnemonic, coin);
            let account = await this.accountNode(rootPriv, coin, purpose);
            wallet.P2WPKH.AccountPub = account.toJSON().xpub;
            wallet.P2WPKH.AccountPriv = account.toJSON().xpriv;
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

        }

    }

    async rootPrivateKey(mnemonic: string, coin: Coin) {
        let network: Network = {
            wif: coin.base58prefixes.Private,
            bip32: {
                public: coin.base58prefixes.ExtPub,
                private: coin.base58prefixes.ExtPriv,
            },
            bech32: coin.base58prefixes.Bech32 ? coin.base58prefixes.Bech32 : "",
            pubKeyHash: coin.base58prefixes.Public,
            scriptHash: coin.base58prefixes.Script,

        };
        let seed = await bip39.mnemonicToSeed(mnemonic);
        return hdkey.fromMasterSeed(seed, network.bip32);
    }

    accountNode(rootPrivKey, coin: Coin, purpose: number) {
        return rootPrivKey.derive("m/" + purpose + "'/" + coin.coinType + "'/" + 0 + "'");
    }

    async addresses(account, coin: Coin, purpose: number, scan: boolean, round: number, gapTop?: number): Promise<Address[]> {
        let network: bitcoin.Network = {
            wif: coin.base58prefixes.Private,
            bip32: {
                public: coin.base58prefixes.ExtPub,
                private: coin.base58prefixes.ExtPriv,
            },
            messagePrefix: "",
            bech32: coin.base58prefixes.Bech32 ? coin.base58prefixes.Bech32 : "",
            pubKeyHash: coin.base58prefixes.Public,
            scriptHash: coin.base58prefixes.Script,

        };
        let AddressesArray: Address[] = [];
        let GapBottom = scan ? 20 * round : 0;
        let GapTop = scan ? 20 * round + 20 : gapTop;
        for (let i = GapBottom; i < GapTop; i++) {
            let derivationDirect = account.derive('m/0/' + i);
            let derivationChange = account.derive('m/1/' + i);

            let addressDirect;
            let addressChange;
            if (purpose === 44) {
                addressDirect = bitcoin.payments.p2pkh({ pubkey: derivationDirect.publicKey, network: network });
                addressChange = bitcoin.payments.p2pkh({ pubkey: derivationChange.publicKey, network: network });
            }
            if (purpose === 49) {
                addressDirect = bitcoin.payments.p2sh({ redeem: bitcoin.payments.p2wpkh({ pubkey: derivationDirect.publicKey, network: network })});
                addressChange = bitcoin.payments.p2sh({ redeem: bitcoin.payments.p2wpkh({ pubkey: derivationChange.publicKey, network: network })});
            }
            if (purpose === 84) {
                addressDirect = bitcoin.payments.p2wpkh({ pubkey: derivationDirect.publicKey, network: network });
                addressChange = bitcoin.payments.p2wpkh({ pubkey: derivationDirect.publicKey, network: network });
            }

            let hashChange = createHash('sha256').update(addressChange.output).digest();
            let swapChange = this.changeEndianness(hashChange.toString('hex'));

            let hashDirect = createHash('sha256').update(addressDirect.output).digest();
            let swapDirect = this.changeEndianness(hashDirect.toString('hex'));

            AddressesArray.push({address: addressDirect.address, path: "m/0/" + i, purpose: purpose,  scripthash: swapDirect, type: "direct"});
            AddressesArray.push({address: addressChange.address, path: "m/1/" + i, purpose: purpose,  scripthash: swapChange, type: "change"})

        }
        return AddressesArray
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
            let split = txHistory[i].path.split("/");
            if (split[1] == 0) {
                PathsDirect.push(split[2])
            }
        }
        return PathsDirect
    }

    private _getChangePathsFromTxHistory(txHistory: any[]): any[] {
        let txHistoryLength = txHistory.length;
        let PathsChange = [];
        for (let i = 0; i < txHistoryLength; i++) {
            let split = txHistory[i].path.split("/");
            if (split[1] == 1) {
                PathsChange.push(split[2])
            }
        }
        return PathsChange
    }
}
