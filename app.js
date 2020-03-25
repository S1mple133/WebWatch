const express = require('express');
const app = express();
const http_redirect = express();
const path = require('path');
const ethlib = require('./lib/ethlib');
const hashlib = require('./lib/hashlib');
const authentication = require('./lib/authentication');
const helmet = require('helmet');
var cookieParser = require('cookie-parser');
var session = require('client-sessions');
var passport = require('passport');
var flash = require('connect-flash');

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
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// STATIC WEBSITE
app.get('/about-us', (req, res) => {
    res.render('about-us', {username: getUsername(req)});
});

app.get('/', (req, res) => {
    res.render('index', {success: req.flash('success')[0], failure: req.flash('failure')[0], username: getUsername(req) });
});

app.get('/contact', (req, res) => {
    res.render('contact', {username: getUsername(req)});
});

app.get('/elements', (req, res) => {
    res.render('elements', {username: getUsername(req)});
});


// WEB SERVER
app.get('/show-websites', isAuthenticated, async (req, res, next) => {
    res.render('show-websites', {
        title: 'Show Websites',
        websites: (await ethlib.getHashesOfPersonJSON(req.user.uid)),
        username: getUsername(req)
    });
});

app.get('/save-website', isAuthenticated, (req, res, next) => {
    res.render('save-website', { username: getUsername(req) });
});


app.post('/save-website', async (req, res) => {
    hash = await hashlib.saveUrlData(req.body.url, req.user.uid);
    req.flash('success', 'Website successfully saved!');
    return res.redirect("/");
});

app.get('/sign-up', (req, res) => {
    res.render('sign-up', { username: getUsername(req), failure: req.flash('failure')[0] });
});

app.get('/login', (req, res) => {
    res.render('login', { username: getUsername(req), failure: req.flash('failure')[0] });
});

app.post('/sign-up', authentication.signup);

app.post('/login', passport.authenticate('local', 
{ 
    successRedirect: '/',
    failureRedirect: '/login'
}));

app.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Successfully logged out!');
    res.redirect("/");
});

app.get('/verify', authentication.verify);

app.get('/reset-pass', (req, res) => {
    return res.render('reset-pass');
});

app.post('/reset-pass', authentication.sendResetPasswordMail);

app.get('/new-password', (req, res)  => {
    return res.render('new-password', {token : req.query.token, uid: req.query.uid});
});

app.post('/new-password', authentication.resetPassword);

app.use(function (err, req, res, next) {
    if(err) {
        res.redirect("/error");
        console.log(err);
    }
});

app.get('/error', (req, res) => {
    res.render('error');
});

const server = app.listen(80, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});
  
function getUsername(req) {
    if(req.user === undefined || req.user.firstname === undefined)
        return undefined;

    return "Hello, " + req.user.firstname;
}

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated())
      return next();

    req.flash('failure', 'Not authenticated!');
    res.redirect("/login");
}