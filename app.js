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


function getUsername(req) {
    if(req.user.firstname === undefined)
        return undefined;

    return "Hello, " + req.user.firstname;
}

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect("/login?not_authenticated=true");
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
    else if(req.query.verified) {
        res.render('index', {success: "Successfully verified email!", username: getUsername(req)});
    }
    else if(req.query.verify_error) {
        res.render('index', {failure: "Could not verify email!", username: getUsername(req)});
    }
    else if(req.query.website_saved) {
        res.render('index', {success: "Successfully saved website!", username: getUsername(req)});
    }
    else if(req.query.reset_pass) {
        res.render('index', {success: "Successfully reset your password! You can now log in.", username: getUsername(req)});
    }
    else if(req.query.reset_mail_sent){
        res.render('index', {success: "Check your inbox!", username: getUsername(req)});
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
app.get('/show-websites', isAuthenticated, async (req, res, next) => {
    websites = await ethlib.getHashesOfPersonJSON(req.user.email);

    res.render('show-websites',{title: 'Show Websites',websites: websites, username: getUsername(req)});
});

app.get('/save-website', isAuthenticated, (req, res, next) => {
    res.render('save-website', { username: getUsername(req) });
});

// TODO: LOGIN (USE OWN ETH ACCOUNT WITH MONEY TRANSFERED FROM USER)
app.post('/save-website', async (req, res) => {
    hash = await hashlib.saveUrlData(req.body.url, req.user.email);

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
                                         req.body.repeat_password,
                                         req.headers.host);

    if(result === authentication.RESULT_CODES.OK) {
        return res.redirect("/?signup=true");
    }

    return res.render('sign-up',{failure: result});
});

app.post('/login', passport.authenticate('local', {
        successRedirect: '/',
        failureFlash: true
    }), function(req, res, info){
        console.log(info);
        res.render('/');
    });

    /*async (req, res) => {
    result = await authentication.login(req);

    if(result == authentication.RESULT_CODES.OK) {
        res.redirect("/?login=true");
    }

    return res.render('login',{failure: result});

});*/

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect("/?logout=true");
});

app.get('/verify', async (req, res) => {
    if(req.query.uid === undefined || req.query.token === undefined)
        throw new Error("Request error! Missing uid or token.");
    
    response = await authentication.verify(req.query.uid, req.query.token);

    if(response === authentication.RESULT_CODES.OK)
        res.redirect('/?verified=true');
    else
        res.redirect('/?verify_error=true');
});

app.get('/reset-pass', (req, res) => {
    return res.render('reset-pass');
});

app.post('/reset-pass', async (req, res) => {
    if(req.body.email === undefined) {
        res.render('reset-pass', {failure: "No email inserted!"});
        return;
    }

    response = await authentication.sendResetPasswordMail(req.body.email, req.headers.host);

    if(response === authentication.RESULT_CODES.OK)
        res.redirect('/?reset_mail_sent=true');
    else
        res.render('reset-pass', {failure: "Could not reset password!"});
});

app.get('/new-password', (req, res)  => {
    return res.render('new-password', {token : req.query.token, uid: req.query.uid});
});

app.post('/new-password', async (req, res)  => {
    if(req.body.token === undefined || req.body.uid === undefined 
        || req.body.password === undefined || req.body.verify_password === undefined) {
        res.render('new-password', {failure: "Cannot change password!"});
        return;
    }

    response = await authentication.resetPassword(req.body.token, req.body.uid, req.body.password, req.body.verify_password );

    if(response === authentication.RESULT_CODES.OK)
        res.redirect('/?reset_pass=true');
    else
        res.render('new-password', {failure: response, token : req.body.token, uid: req.body.uid});
});

app.use(function (err, req, res, next) {
    res.redirect("/error");
    next(err);
});

app.get('/error', (req, res) => {
    res.render('error');
});

const server = app.listen(80, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});
  