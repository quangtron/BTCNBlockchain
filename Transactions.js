const CryptoJS = require('crypto-js');
const ecdsa = require('elliptic');
const _ = require('lodash');

const ec = new ecdsa.ec('secp256k1');

const COINBASE_AMOUNT = 50;

class UnspentTxOut {
    constructor(txOutId, txOutIndex, address, amount) {
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
        this.address = address;
        this.amount = amount;
    }
}

class TxIn {
    constructor(txOutId, txOutIndex, signature) {
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
        this.signature = signature;
    }
}

class TxOut {
    constructor(address, amount) {
        this.address = address;
        this.amount = amount;
    }
}

class Transaction {
    constructor(id, txIns, txOuts) {
        this.id = id;
        this.txIns = txIns;
        this.txOuts = txOuts;
    }
}

const getTransactionId = (transaction) => {
    const txInContent = transaction.txIns
        .map((txIn) => txIn.txOutId + txIn.txOutIndex)
        .reduce((a, b) => a + b, '');

    const txOutContent = transaction.txOuts
        .map((txOut) => txOut.address + txOut.amount)
        .reduce((a, b) => a + b, '');

    return CryptoJS.SHA256(txInContent + txOutContent).toString();
};

const getCoinbaseTransaction = (address, blockIndex) => {
    const txIn = new TxIn('', blockIndex, '');
    const txOuts = new TxOut(address, COINBASE_AMOUNT);

    const t = new Transaction('', [txIn], [txOuts]);
    t.id = getTransactionId(t);

    return t;
};

const getCoinTransaction = (blockIndex, items) => {
    let txIns = [];
    let txOuts = [];
    let txOut;

    for(let item of items.txIns){
        const txIn = new TxIn(item.data[0].id, blockIndex, '');
        txOut = new TxOut(items.txOuts[0].address, parseInt(items.txOuts[0].amount));

        txIns.push(txIn);
    }
    txOuts.push(txOut);

    const t = new Transaction('', txIns, txOuts);
    t.id = getTransactionId(t);

    return t;
}

const getUnspentTxOutsForTransaction = (wallet, amount, address) => {
    let sumAmount = wallet.transactionsPool.length;
    let amountHandle = amount;

    for(let item of wallet.unspentTxOuts){
        sumAmount += item.amount;
    }

    if(amountHandle <= sumAmount){
        let indexPool = wallet.transactionsPool.length;

        for(let item of wallet.blockchains.blockchain){
            if(item.index === wallet.unspentTxOuts[0].txOutIndex){
                txIn = item;
                break;
            }
        }

        const amount2 = sumAmount - amount;
        const addr2 = wallet.publicAddress;

        wallet.transactionsPool.push({poolId: indexPool, txId: 0, txIns: [txIn], txOuts: [{address, amount}, {addr2, amount2}], address2: wallet.publicAddress});
        amountHandle -= wallet.unspentTxOuts[0].amount;
        wallet.unspentTxOuts.splice(0, 1);

        while(amountHandle > 0){
            for(let item of wallet.blockchains.blockchain){
                if(item.index === wallet.unspentTxOuts[0].txOutIndex){
                    txIn = item;
                    break;
                }
            }

            wallet.transactionsPool[indexPool].txIns.push(txIn); 
            amountHandle -= wallet.unspentTxOuts[0].amount;
            wallet.unspentTxOuts.splice(0, 1);
        }

        wallet.transactionsPool[indexPool].txId = getTransactionId(wallet.transactionsPool[indexPool])

        return wallet.transactionsPool;
    }
}

module.exports = {
    getTransactionId, UnspentTxOut, TxIn, TxOut, getCoinbaseTransaction, Transaction, getUnspentTxOutsForTransaction, getCoinTransaction
};
