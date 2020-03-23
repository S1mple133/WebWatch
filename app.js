const express = require('express');
const app = express();
const path = require('path');
const ethlib = require(path.resolve(__dirname, 'lib', 'ethlib'));
const hashlib = require(path.resolve(__dirname, 'lib', 'hashlib'));
const authentication = require(path.resolve(__dirname, 'lib', 'authentication'));
const helmet = require('helmet');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var csrf = require('csurf');
var session = require('client-sessions');
const url = require('url');

//var csrfProtection = csrf({ cookie: true })
//var parseForm = bodyParser.urlencoded({ extended: false })

app.set('view engine', 'pug');
app.set('json escape', true); // XSS

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(express.static(path.resolve(__dirname, 'data')));
app.use(helmet());
app.use(cookieParser());
app.use(session({
    cookieName: 'session',
    secret: '$2b$10$SJqhsrRHLEV0cnf3ufZsSObpmrRQzvi4v/lw8/O0EJ4Uv/XhOdYuW',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
  }));

//app.use(cookieParser());
//app.use(csrfProtection);

// STATIC WEBSITE
app.get('/about-us', (req, res) => {
    res.render('about-us');
});

app.get('/', (req, res) => {
    if(req.query.success) {
        res.render('index', {success: "Successfully logged in!"});
    }else {
        res.render('index');
     }
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/elements', (req, res) => {
    res.render('elements');
});


// WEB SERVER
app.get('/show-websites', (req, res) => {
    ethlib.getHashesOfPersonJSON("0x9720E8EA7aD42c8d3CE8671b7271E6E7Ef41695b", function(websites) {
        res.render('show-websites',{title: 'Show Websites',websites: websites});
    });
});

app.get('/save-website', /*csrfProtection,*/ (req, res) => {
    res.render('save-website', { /*csrfToken: req.csrfToken()*/ });
});

app.get('/website-saved', (req, res) => {
    res.render('index-success');
});

// TODO: LOGIN (USE OWN ETH ACCOUNT WITH MONEY TRANSFERED FROM USER)
app.post('/save', /*parseForm,csrfProtection,*/ (req, res) => {
    hashlib.saveUrlData("0x9720E8EA7aD42c8d3CE8671b7271E6E7Ef41695b", "E018D766E4A1ED365EB8EB9B6F8D0DDE12BF4FCE1107FB88DD8F34197D3F9970", req.body.url, function (hash) {
        //console.log(hash);
    });
    //return res.redirect('/website-saved');
});

// LOGIN / REGISTRATION
app.get('/sign-up', /*csrfProtection,*/ (req, res) => {
    //res.render('sign-up', { csrfToken: req.csrfToken() });
    res.render('sign-up');
});

app.get('/login', /*csrfProtection,*/ (req, res) => {
    //res.render('login', { csrfToken: req.csrfToken() });
    res.render('login');
});

app.post('/sign-up', /*parseForm, csrfProtection,*/ async (req, res) => {
    result = await authentication.signup(req.body.first_name, req.body.last_name, req.body.email, req.body.password, req.body.repeat_password);

    if(result === authentication.RESULT_CODES.OK) 
        return res.render('sign-up',{success: result});
    else
        return res.render('sign-up',{failure: result});
});

app.post('/login', /*parseForm, csrfProtection,*/ async (req, res) => {
    result = await authentication.login(req);

    if(result == authentication.RESULT_CODES.OK) 
        res.redirect(url.format({
            pathname:"/",
            query: {
               "success": "true"
             }
          }));
    else
        return res.render('login',{failure: result});
});


const server = app.listen(80, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});
