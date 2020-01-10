const express = require('express');
const app = express();
const ethlib = require('../WebWatch/lib/ethlib');
const hashlib = require('../WebWatch/lib/hashlib');
const url = require('url');

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/../WebWatch/data'));

app.get('/show-websites', (req, res) => {
    ethlib.getHashesOfPersonJSON("0x9720E8EA7aD42c8d3CE8671b7271E6E7Ef41695b", function(websites) {
        res.render('saved',{title: 'Show Websites',websites: websites});
    });
});

app.get('/abc', (req, res) => {
        res.render('layout');
});

app.post('/save', function (req, res) {
    req.on('data', function (data) {
        var parsed = url.parse("http://localhost/index.php?" + data.toString('utf8'), true).query;
        hashlib.saveUrlData(parsed.address, parsed.privateKey, parsed.url, function (hash) {
            //console.log(hash);
        });
    });

    res.end();
});

const server = app.listen(80, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});