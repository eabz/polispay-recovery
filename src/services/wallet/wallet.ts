import * as bip39 from "bip39"
import * as bitcoin from 'bitcoinjs-lib';
import * as hdkey from "hdkey"
import {Coin} from "../../models/coin-factory/coin";
import {Address, Network} from "../../models/wallet/wallet";
import {createHash} from "crypto";

export class WalletCreator {

    async createWallet(mnemonic: string, coin: Coin, purpose: number) {
        let rootPriv = await this.rootPrivateKey(mnemonic, coin);
        let account = await this.accountNode(rootPriv, coin, purpose);
        let addresses = await this.addresses(account, coin, purpose);
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

    async addresses(account, coin: Coin, purpose: number): Promise<Address[]> {
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
        let firstGap = 20;
        for (let i = 0; i < firstGap; i++) {
            let derivationDirect = account.derive('m/0' + '/' + i);
            let derivationChange = account.derive('m/1' + '/' + i);
            let addressDirect = bitcoin.payments.p2pkh({ pubkey: derivationDirect.publicKey, network: network });
            let addressChange = bitcoin.payments.p2pkh({ pubkey: derivationChange.publicKey, network: network });

            let hashChange = createHash('sha256').update(addressChange.output).digest();
            let swapChange = this.changeEndianness(hashChange.toString('hex'));

            let hashDirect = createHash('sha256').update(addressDirect.output).digest();
            let swapDirect = this.changeEndianness(hashDirect.toString('hex'));

            AddressesArray.push({address: addressDirect.address, derivationPath: i, purpose: purpose,  scripthash: swapDirect, type: "direct"});
            AddressesArray.push({address: addressChange.address, derivationPath: i, purpose: purpose,  scripthash: swapChange, type: "change"})

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

}
