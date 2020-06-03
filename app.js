const express = require('express');
const exphbs = require('express-handlebars');
const morgan = require('morgan');
const hbs_sections = require('express-handlebars-sections');
const faker = require('faker');
const moment = require('moment');

const Blockchain = require('./Blockchain');
const {getPublicFromWallet} = require('./Wallet');
const {getCoinbaseTransaction, UnspentTxOut, getTransactionId, getUnspentTxOutsForTransaction} = require('./Transactions');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.engine('hbs', exphbs({
    defaultLayout: 'index.hbs',
    layoutsDir: 'views/_layout',
    helpers: {
        section: hbs_sections(),
    }
}))

app.set('view engine', 'hbs');

const wallets = [];

app.get('/', (req, res, next) => {
    res.render('_layout/index');
})

app.get('/:id', (req, res, next) => {
    const id = req.params.id;
    // const listBlock = wallets[id].blockchains.get();
    
    for(let i = 0; i < wallets.length; i++){
        wallets[i].active = false;
    }
    wallets[id].active = true;

    // for(item of listBlock){
    //     const ts = moment(item.timestamp).format('LLLL');
    //     item.timestamp = ts;
    // }
    for(let item of wallets[id].transactionsPool){
        // console.log(1);
        for(let i of item.txIns){
            // for(let j of i.data){
            //     console.log(j);
            // }
            console.log(i.data);
        }
    }
    console.log('pool: ', wallets[id].transactionsPool);
    console.log('uns: ', wallets[id].unspentTxOuts);
    
    res.render('_layout/index', {wallet: wallets[id], wallets});
})

app.get('/:id/transactions', (req, res, next) => {
    const id = req.params.id;
    const hash = wallets[id].blockchains.blockchain[0].hash;

    res.render('transactions', {wallet: wallets[id], hash, layout: false});
})

app.post('/:id', (req, res, next) => {
    const id = req.params.id;
    const address = wallets[id].publicAddress;
    const blockIndex = wallets[id].blockchains.blockchain.length;

    const t = getCoinbaseTransaction(address, blockIndex);
    wallets[id].blockchains.mine([t]);

    const uns = new UnspentTxOut('', blockIndex, address, 50);
    wallets[id].unspentTxOuts.push(uns);

    wallets[id].balance = 0;
    console.log('abc: ', wallets[id].unspentTxOuts);

    for(let unspentTxOut of wallets[id].unspentTxOuts){
        wallets[id].balance += unspentTxOut.amount;
    }

    res.redirect(`/${id}`);
})

app.post('/:id/sendCoins', (req, res, next) => {
    const id = req.params.id;

    const amount = req.body.amount;
    const address = req.body.address;

    getUnspentTxOutsForTransaction(wallets[id], amount, address);

    res.redirect(`/${id}`);
})

app.post('/', (req, res, next) => {
    const w_Id = wallets.length || 0;
    const publicAddress = getPublicFromWallet();
    const balance = 0;
    const blockchains = new Blockchain;
    const unspentTxOuts = [];
    const transactionsPool = [];
    const walletName = faker.name.firstName();
    const active = true;

    wallets.push({ w_Id, publicAddress, balance, walletName, blockchains, unspentTxOuts, transactionsPool, active });

    res.redirect(`/${w_Id}`);
})

const PORT = 3000;
app.listen(PORT, _ => {
    console.log(`server is running at http://localhost:${PORT}`);
})