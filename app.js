const express = require('express');
const app = express();
const http_redirect = express();
const path = require('path');
const ethlib = require(path.resolve(__dirname, 'lib', 'ethlib'));
const hashlib = require(path.resolve(__dirname, 'lib', 'hashlib'));
const authentication = require(path.resolve(__dirname, 'lib', 'authentication'));
const helmet = require('helmet');
var cookieParser = require('cookie-parser');
var session = require('client-sessions');
var https = require('https');
const fs = require('fs');

app.set('view engine', 'pug');
app.set('json escape', true);

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

function getUsername(req) {
    if(req.session.firstname === undefined)
        return undefined;

    return "Hello, " + req.session.firstname;
}

// STATIC WEBSITE
app.get('/about-us', (req, res) => {
    res.render('about-us', {username: getUsername(req)});
});

app.get('/', (req, res) => {
    if(req.query.signup) {
        res.render('index', {success: "Successfully created an account! Check your mail for verification.", username: getUsername(req)});
    }
    else if(req.query.login) {
        res.render('index', {success: "Successfully logged in!", username: getUsername(req)});
    }
    else if(req.query.logout) {
        res.render('index', {success: "Successfully logged out!", username: getUsername(req)});
    }
    else if(req.query.website_saved) {
        res.render('index', {success: "Successfully saved website!", username: getUsername(req)});
    }
    else {
        res.render('index', {username: getUsername(req)});
     }
});

app.get('/contact', (req, res) => {
    res.render('contact', {username: getUsername(req)});
});

app.get('/elements', (req, res) => {
    res.render('elements', {username: getUsername(req)});
});


// WEB SERVER
app.get('/show-websites', async (req, res, next) => {
    if(!req.session.email){
        res.redirect("/login?not_authenticated=true");
        return;
    }

    websites = await ethlib.getHashesOfPersonJSON(req.session.email);

    res.render('show-websites',{title: 'Show Websites',websites: websites, username: getUsername(req)});
});

app.get('/save-website', (req, res, next) => {
    if(!req.session.email){
        res.redirect("/login?not_authenticated=true");
        return;
    }

    res.render('save-website', { username: getUsername(req) });
});

// TODO: LOGIN (USE OWN ETH ACCOUNT WITH MONEY TRANSFERED FROM USER)
app.post('/save-website', async (req, res) => {
    hash = await hashlib.saveUrlData(req.body.url, req.session.email);

    return res.redirect("/?website_saved=true");
});

// LOGIN / REGISTRATION
app.get('/sign-up', (req, res) => {
    res.render('sign-up', { username: getUsername(req) });
});

app.get('/login', (req, res) => {
    let response;

    if(req.query.not_authenticated)
        response = authentication.RESULT_CODES.NOT_AUTHENTICATED;

    res.render('login', { username: getUsername(req), failure: response });
});

app.post('/sign-up', async (req, res) => {
    result = await authentication.signup(req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.password,
        req.body.repeat_password);

    if(result === authentication.RESULT_CODES.OK) {
        return res.redirect("/?signup=true");
    }

    return res.render('sign-up',{failure: result});
});

app.post('/login', async (req, res) => {
    result = await authentication.login(req);

    if(result == authentication.RESULT_CODES.OK) {
        res.redirect("/?login=true");
    }

    return res.render('login',{failure: result});
});

app.get('/logout', (req, res) => {
    req.session.email = undefined;
    req.session.firstname = undefined;
    req.session.lastname = undefined;

    res.redirect("/?logout=true");
});

app.get('/error', (req, res) => {
    res.render('error');
});

app.use(function (err, req, res, next) {
    res.redirect("/error");
    next(err);
});

/*const server = app.listen(80, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});*/

// Https redirect
http_redirect.get('*', function(req, res) {  
    res.redirect('https://' + req.headers.host + req.url);
});

http_redirect.listen(80, () => {
    console.log(`Https Redirect server running → PORT 80`);
});

https.createServer({
    key: fs.readFileSync(path.resolve(__dirname, 'cert/key.pem')),
    cert: fs.readFileSync(path.resolve(__dirname, 'cert/cert.pem'))
}, app)
.listen(443, function () {
    console.log(`Express running → PORT 443`);
});
  