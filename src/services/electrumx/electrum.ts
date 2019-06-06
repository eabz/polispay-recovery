import {Address} from "../../models/wallet/wallet";
import {Coin} from "../../models/coin-factory/coin";
import * as JsonRpc from "simple-jsonrpc-js"

export class Electrum {

    async electrumClient(host, port) {
        let readyState = false;
        const jrpc = new JsonRpc();
        const socket = new WebSocket('wss://' + host + ':' + port);
        jrpc.on('view.setTitle',  (title) => {
            document.getElementsByClassName('title')[0].innerHTML = title
        });
        socket.onmessage = event => {
            jrpc.messageHandler(event.data);
        };
        jrpc.toStream = msg => socket.send(msg);
        socket.onerror = error => console.error('Error: ' + error);
        socket.onclose = event => {
            if (event.wasClean) console.info('Connection close was clean');
            else console.error('Connection suddenly close');
            console.info(`Close code: ${event.code} reason: ${event.reason}`)
        };
        const ready = new Promise((resolve, reject) => {
            if (readyState) resolve();
            socket.onopen = () => {
                readyState = true;
                resolve()
            };
            socket.onerror = () => {
                reject()
            }
        });
        await ready;
        return jrpc
    }

    async getAddrHistory(address: Address[], coin: Coin) {
        const rpc = await this.electrumClient(coin.electrumHost.url, coin.electrumHost.port);
        let batch = [];
        for (let i = 0; i < address.length; i++) {
            let call = {
                method: 'blockchain.scripthash.get_history',
                params: [address[i].scripthash]
            };
            batch.push({call});
        }
        let batchRes = await rpc.batch(batch);
        let addpaths = batchRes.map((txArr, ind) =>
            txArr.map((tx) =>  {
                return{ tx_hash: tx.tx_hash, height: tx.height, path: address[ind].path, address: address[ind].address };
            }));
        rpc.close();
        return [].concat.apply([], addpaths);
    }

    async getAddrUtxos(address: Address[], coin: Coin) {
        const rpc = await this.electrumClient(coin.electrumHost.url, coin.electrumHost.port);
        let batch = [];
        for (let i = 0; i < address.length; i++) {
            let call = {
                method: 'blockchain.scripthash.listunspent',
                params: [address[i].scripthash]
            };
            batch.push({call});
        }
        let batchRes = await rpc.batch(batch);
        let addpaths = batchRes.map((txArr, ind) =>
            txArr.map((tx) =>  {
                return{ tx_hash: tx.tx_hash, height: tx.height, path: address[ind].path, address: address[ind].address };
            }));
        rpc.close();
        return [].concat.apply([], addpaths);
    }
}
