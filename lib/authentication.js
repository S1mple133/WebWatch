var mysql = require('mysql');
const util = require('util');
var bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const uuidv4 = require('uuid/v4');
const hashlib = require('./hashlib');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done){
    done(null, user.uid);
});

passport.deserializeUser(async function(id, done){
    let res = await query("SELECT * FROM users WHERE uid = ? AND verified=true", id);
    done(null, res[0]);
});

passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true //passback entire req to call back
  } , async function (req, email, password, done){
    try {
        let res = await query("SELECT * FROM users WHERE email = ? AND verified=true", email);
        
        if(res.length > 0 && bcrypt.compareSync(password, res[0].password)) {
            return done(null, res[0]);
        }
    } catch(e){
        console.log(e);
    }

    return done(null, false);
  })
);

const GMAIL_USER = "noreply.webwatch.tools@gmail.com";
const GMAIL_PASS = "Sommer1mWinter";

var mailTransporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
    }
});

function generateToken() {
    length = 64;
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!.$';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

 function hashPass(pw) {
    return bcrypt.hashSync(pw, bcrypt.genSaltSync());
 }

function getSignupMailOptions(token, uid, host, name, email)  {
    return {
        from: 'Web Watch <noreply.webwatch.tools@gmail.com>',
        to: email,
        subject: 'Account Verification',
        text: `Hello ${name},\n\n` +
            `verify your account by clicking on http://${host}/verify?token=${token}&uid=${uid}\n\n` +
            "Greetings,\nWebWatch Team",
        html: `<p>Hello ${name},</p></br></br>` +
        `<p>verify your account by clicking <a href='http://${host}/verify?token=${token}&uid=${uid}'>here</a></p></br></br>` +
        "<p>Greetings,</p><p>WebWatch Team</p>" 
    }
}


function getPassResetMailOptions(token, uid, host, name, email)  {
    return {
        from: 'Web Watch <noreply.webwatch.tools@gmail.com>',
        to: email,
        subject: 'Password Reset',
        text: `Hello ${name},\n\n` +
            `You issued a password change request. Click on http://${host}/new-password?token=${token}&uid=${uid} to change your password.\n` +
            "If you didn't issue any request, ignore this email.\n\n" +
            "Greetings,\nWebWatch Team",
        html: `<p>Hello ${name},</p></br></br>` +
        `<p>You issued a password change request. Click <a href='http://${host}/new-password?token=${token}&uid=${uid}'>here</a> to change your password</p></br>` +
        "<p>If you didn't issue any request, ignore this email.</p></br></br>" + +
        "<p>Greetings,</p><p>WebWatch Team</p>" 
    }
}


const RESULT_CODES = {
    OK: 'Success!',
    EMAIL_INCORRECT: 'Email has wrong syntax or is already used.',
    PASS_ERR : 'Password is weak or passwords don\'t match.',
    ALPHANUMERIC_CHARS:'Last name and Name should only contain alphanumeric characters.',
    UNKNOWN_ERROR:'Failed! Try again later.',
    LOGIN_FAILED: 'There was a problem while logging in!',
    NOT_AUTHENTICATED: "You have to log in to perform that action!",
    MAIL_ERROR: "Could not send verification email! Please try again later!.",
    NOT_VERIFIED: "Email is not verified!",
    RESET_PASS_ERROR: "Could not reset your password! Make sure you wrote it correctly."
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "webwatch"
});

const query = util.promisify(con.query).bind(con);
const compare_pass = util.promisify(bcrypt.compare).bind(bcrypt);

var methods = {
    signup: async (name, lastname, email, pw, repeat_pw, host) => {

        if(pw == repeat_pw) {
            if(/^[a-zA-Z]+$/.test(name) && /^[a-zA-Z]+$/.test(lastname)) {
                if(validateEmail(email)) {
                    try {
                        let res = await query("SELECT email FROM users WHERE email = ?", email);

                        if(res.length == 0) {
                            const sqlinsertquery = "INSERT INTO users (firstname, lastname, email, password, uid) values(?, ?, ?, ?, ?)";
                            const uid = uuidv4();
                            const token = generateToken();
                            const sqldata = [name, lastname, email, hashPass(pw), uid];

                            // Send mail
                            await mailTransporter.sendMail(getSignupMailOptions(token, uid, host, name, email));
                            await query("INSERT INTO unverified_users(uid, token) VALUES(?,?)", [uid, token]);
                            await query(sqlinsertquery, sqldata);
                            
                            return RESULT_CODES.OK;

                        } else {
                            return RESULT_CODES.EMAIL_INCORRECT;
                        }
                    } catch(e) {
                        return RESULT_CODES.UNKNOWN_ERROR;
                    }
                }else {
                    return RESULT_CODES.EMAIL_INCORRECT;
                }
            }else {
                return RESULT_CODES.ALPHANUMERIC_CHARS;
            }
        }else {
            return RESULT_CODES.PASS_ERR;
        }
    },

    /*login: async (req) => {
        const email = req.body.email;
        const password = req.body.password;

        try {
            let res = await query("SELECT * FROM users WHERE email = ? AND verified=true", email);
            
            if(res.length > 0 && bcrypt.compareSync(password, res[0].password)) {
                /*req.session.firstname = res[0].firstname;
                req.session.lastname = res[0].lastname;
                req.session.email = res[0].email;
                return RESULT_CODES.OK;
                req.login(user, function(err) {
                    if (err) { return next(err); }
                    return res.redirect('/users/' + req.user.username);
                });
            }
        } catch(e){
            console.log(e);
        }

        return RESULT_CODES.LOGIN_FAILED;
    },*/

    verify: async (uid, token) => {
        try {
            let res = await query("SELECT id FROM unverified_users WHERE uid = ? AND token = ?", [uid, token]);

            if(res.length > 0) {
                await query("UPDATE users SET verified=true WHERE uid = ?", uid);
                await query("DELETE FROM unverified_users WHERE uid = ?", uid);
                return RESULT_CODES.OK;
            }
            else {
                return RESULT_CODES.ALREADY_VERIFIED;
            }
        } catch(e) {
            console.log(e.message);
            return RESULT_CODES.UNKNOWN_ERROR;
        }
    },

    sendResetPasswordMail: async (email, host) => {
        try {
            let res = await query("SELECT firstname, uid, verified FROM users WHERE email = ?", email);

            if(res.length > 0) {
                if(res[0].verified) {
                        token = generateToken();
                        await mailTransporter.sendMail(getPassResetMailOptions(token, res[0].uid, host, res[0].firstname, email));
                        await query("INSERT INTO reset_pass(uid, token) VALUES(?,?)", [res[0].uid, token]);
                        return RESULT_CODES.OK;                    }
                }
                else {
                    return RESULT_CODES.NOT_VERIFIED;
            }
        } catch(e) {
            console.log(e);
            return RESULT_CODES.UNKNOWN_ERROR;
        }
    },

    resetPassword: async (token, uid, password, verify_password) => {
        try {
            if(password === verify_password) {
                let res = await query("SELECT token FROM reset_pass WHERE uid = ?", uid);

                if(res.length > 0 && res[0].token === token) {
                    await query("UPDATE users SET password=? WHERE uid = ?", [hashPass(password), uid]);
                    await query("DELETE FROM reset_pass WHERE uid = ?", uid);
                    return RESULT_CODES.OK;
                }
            }
        } catch(e) {
            console.log(e);
            return RESULT_CODES.UNKNOWN_ERROR;
        }

        return RESULT_CODES.RESET_PASS_ERROR;
    },
    
    RESULT_CODES: RESULT_CODES
};

module.exports = methods;