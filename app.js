const express = require('express');
const exphbs = require('express-handlebars');
const morgan = require('morgan');
const hbs_sections = require('express-handlebars-sections');
const faker = require('faker');
const moment = require('moment');

const Blockchain = require('./Blockchain');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.engine('hbs', exphbs({
    defaultLayout: 'index.hbs',
    layoutsDir: 'views',
    helpers: {
        section: hbs_sections(),
    }
}))

app.set('view engine', 'hbs');

const blockchain = new Blockchain;
let peers = [
    {
        p_Id: 0,
        peer: 'Ton',
        list: blockchain,
        active: false,
    }
];

app.get('/', (req, res, next) => {
    const listBlock = peers[0].list.get();
    peers[0].active = true;
    
    for(item of listBlock){
        const ts = moment.unix(1589811488).toString();
        item.timestamp = ts;
    }
    
    res.render('index', {list: listBlock, id: 0, peers: peers});
})

app.get('/:id', (req, res, next) => {
    const id = req.params.id;
    const listBlock = peers[id].list.get();
    
    for(let i = 0; i < peers.length; i++){
        peers[i].active = false;
    }
    peers[id].active = true;

    for(item of listBlock){
        const ts = moment(item.timestamp).format('LLLL');
        item.timestamp = ts;
    }
    
    res.render('index', {list: listBlock, id: id, peers: peers});
})

app.post('/:id', (req, res, next) => {
    const id = req.params.id;
    peers[id].list.mine(req.body.data)

    res.redirect(`/${id}`);
})

app.post('/', (req, res, next) => {
    const list = new Blockchain;
    const p_Id = peers.length;
    const peer = faker.name.firstName();
    const active = true;

    peers.push({ p_Id, peer, list, active });

    res.redirect(`/${p_Id}`);
})

const PORT = 3000;
app.listen(PORT, _ => {
    console.log(`server is running at http://localhost:${PORT}`);
})