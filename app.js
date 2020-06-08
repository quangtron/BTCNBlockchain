const express = require('express');
const exphbs = require('express-handlebars');
const morgan = require('morgan');
const hbs_sections = require('express-handlebars-sections');
const faker = require('faker');
const moment = require('moment');

const Blockchain = require('./Blockchain');
const {getPublicFromWallet} = require('./Wallet');
const {getCoinbaseTransaction, UnspentTxOut, getCoinTransaction, getUnspentTxOutsForTransaction} = require('./Transactions');

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
    res.render('home');
})

app.get('/:id', (req, res, next) => {
    const id = req.params.id;
    
    for(let i = 0; i < wallets.length; i++){
        wallets[i].active = false;
    }
    wallets[id].active = true;

    console.log('pool: ', wallets[id].transactionsPool);
    console.log('uns: ', wallets[id].unspentTxOuts);
    res.render('home', {wallet: wallets[id], wallets});
})

app.get('/:id/transactions', (req, res, next) => {
    const id = req.params.id;
    const hash = wallets[id].blockchains.blockchain[0].hash;

    res.render('transactions', {wallet: wallets[id], hash});
})

app.get('/:id/transactions/:b_id', (req, res, next) => {
    const id = req.params.id;
    const b_id = req.params.b_id;
    console.log(wallets[id].blockchains.blockchain[b_id]);
    for(let i of wallets[id].blockchains.blockchain[b_id].data){
        console.log('zzvz', i.txIns);
    }

    res.render('transactionDetail', {block: wallets[id].blockchains.blockchain[b_id], difficulty: wallets[id].blockchains.difficulty, wallet: wallets[id]});
})

app.post('/:id', (req, res, next) => {
    const id = req.params.id;
    const address = wallets[id].publicAddress;
    const blockIndex = wallets[id].blockchains.blockchain.length;
    const data = [];

    const t = getCoinbaseTransaction(address, blockIndex);
    data.push(t);

    for(let item of wallets[id].transactionsPool){
        const tran = getCoinTransaction(blockIndex, item);
        data.push(tran);
    }

    wallets[id].blockchains.mine(data);

    const uns = new UnspentTxOut('', blockIndex, address, 50);
    wallets[id].unspentTxOuts.push(uns);

    wallets[id].balance = 0;
    console.log('abc: ', wallets[id].unspentTxOuts);

    for(let unspentTxOut of wallets[id].unspentTxOuts){
        wallets[id].balance += unspentTxOut.amount;
    }

    wallets[id].transactionsPool = [];

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
    const w_Id = wallets.length;
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