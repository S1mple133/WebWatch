const express = require('express');
const app = express();
const ethlib = require('../WebWatch/lib/ethlib');

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    ethlib.getHashesOfPersonJSON("0x9720E8EA7aD42c8d3CE8671b7271E6E7Ef41695b", function(jsoninstring) {
        res.render('saved',{title: 'Show Websites',websites: JSON.parse(jsoninstring).websites});
    });
});

const server = app.listen(80, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});