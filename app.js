const express = require('express');
const app = express();
const ethlib = require('./lib/ethlib');
const hashlib = require('./lib/hashlib');
const authentication = require('./lib/authentication');

app.set('view engine', 'pug');
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/data'));
//app.use(express.static(__dirname + '/views'));

// STATIC WEBSITE
app.get('/about-us', (req, res) => {
    res.render('about-us');
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/elements', (req, res) => {
    res.render('elements');
});


// WEB SERVER
// TODO: Update for new template
app.get('/show-websites', (req, res) => {
    //res.sendFile(__dirname + "/views/show-websites.html");
    ethlib.getHashesOfPersonJSON("0x9720E8EA7aD42c8d3CE8671b7271E6E7Ef41695b", function(websites) {
        res.render('show-websites',{title: 'Show Websites',websites: websites});
    });
});

app.get('/save-website', (req, res) => {
    res.render('save-website');
});

app.get('/website-saved', (req, res) => {
    res.render('index-success');
});

// TODO: LOGIN (USE OWN ETH ACCOUNT WITH MONEY TRANSFERED FROM USER)
app.post('/save', (req, res) => {
    hashlib.saveUrlData("0x9720E8EA7aD42c8d3CE8671b7271E6E7Ef41695b", "E018D766E4A1ED365EB8EB9B6F8D0DDE12BF4FCE1107FB88DD8F34197D3F9970", req.body.url, function (hash) {
        //console.log(hash);
    });
    //return res.redirect('/website-saved');
});

// LOGIN / REGISTRATION
app.get('/sign-up', (req, res) => {
    res.render('sign-up');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/sign-up', async (req, res) => {
    result = await authentication.signup(req);

    if(result === authentication.RESULT_CODES.OK) 
        return res.render('sign-up',{success: result});
    else
        return res.render('sign-up',{failure: result});
});

app.post('/login', (req, res) => {
    
});


const server = app.listen(80, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});
