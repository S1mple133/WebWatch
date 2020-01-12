const express = require('express');
const app = express();
const ethlib = require('../WebWatch/lib/ethlib');
const hashlib = require('../WebWatch/lib/hashlib');

app.set('view engine', 'pug');
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/../WebWatch/data'));

app.get('/show-websites', (req, res) => {
    ethlib.getHashesOfPersonJSON("0x9720E8EA7aD42c8d3CE8671b7271E6E7Ef41695b", function(websites) {
        res.render('show-website',{title: 'Show Websites',websites: websites});
    });
});

app.get('/save-website', (req, res) => {
    res.render('save-website',{title: 'Save Website'});
});

app.get('/', (req, res) => {
    res.render('index',{title: 'Home'});
});

app.post('/save', function(req, res){
    hashlib.saveUrlData(req.body.address, req.body.privateKey, req.body.url, function (hash) {
        //console.log(hash);
    });
    return res.redirect('/save-website');
});

const server = app.listen(80, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});