var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require("express-session");
var bodyParser = require("body-parser");
var flash = require("connect-flash");
var db = require('./lib/db');
var bcrypt = require('bcrypt-nodejs');

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var aboutUsRouter = require('./routes/about-us');
var contactRouter = require('./routes/contact');
var elementsRouter = require('./routes/elements');
var errorRouter = require('./routes/error');
var logoutRouter = require('./routes/logout');
var newPasswordRouter = require('./routes/new-password');
var resetPasswordRouter = require('./routes/reset-password');
var saveWebsiteRouter = require('./routes/save-website');
var showWebsitesRouter = require('./routes/show-websites');
var signupRouter = require('./routes/signup');
var verifyRouter = require('./routes/verify');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Allow access to /data
app.use('/data', express.static(path.join(__dirname, 'data')));

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session(
  {secret: "AuRpOSYTFsb1D4YVdONR",
  name: "session",
  proxy: true,
  resave: true,
  saveUninitialized: true}
  ));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', indexRouter);
app.use('/index', indexRouter);
app.use('/login', loginRouter);
app.use('/about-us', aboutUsRouter);
app.use('/contact', contactRouter);
app.use('/elements', elementsRouter);
app.use('/logout', logoutRouter);
app.use('/new-password', newPasswordRouter);
app.use('/reset-password', resetPasswordRouter);
app.use('/save-website', saveWebsiteRouter);
app.use('/show-websites', showWebsitesRouter);
app.use('/signup', signupRouter);
app.use('/verify', verifyRouter);
app.use('/error', errorRouter);

app.use(function(req, res, next) {
  //next(createError(404));
  res.redirect("/");
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err);
  res.status(err.status || 500);
  res.render('error');
});

passport.serializeUser(function(user, done){
  done(null, user.uid);
});

passport.deserializeUser(async function(id, done){
  let res = await db.query("SELECT * FROM users WHERE uid = ? AND verified=true", id);
  done(null, res[0]);
});

passport.use('local', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true //passback entire req to call back
} , async function (req, email, password, done){
  try {
      let res = await db.query("SELECT * FROM users WHERE email = ? AND verified=1", email);

      if(res.length > 0 && bcrypt.compareSync(password, res[0].password)) {
          return done(null, res[0]);
      }
  } catch(e){
      console.log(e);
  }

  return done(null, false);
})
);

module.exports = app;