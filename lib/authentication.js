var mysql = require('mysql');
const util = require('util');
var bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const uuidv4 = require('uuid/v4');
const hashlib = require('./hashlib');

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
    signup: async (req, res, next) => {
        let name = req.body.first_name;
        let lastname = req.body.last_name;
        let email = req.body.email;
        let pw = req.body.password;
        let repeat_pw = req.body.repeat_password;
        let host = req.headers.host;

        if(pw == repeat_pw) {
            if(/^[a-zA-Z]+$/.test(name) && /^[a-zA-Z]+$/.test(lastname)) {
                if(validateEmail(email)) {
                    try {
                        let data = await query("SELECT email FROM users WHERE email = ?", email);

                        if(data.length == 0) {
                            const sqlinsertquery = "INSERT INTO users (firstname, lastname, email, password, uid) values(?, ?, ?, ?, ?)";
                            const uid = uuidv4();
                            const token = generateToken();
                            const sqldata = [name, lastname, email, hashPass(pw), uid];

                            // Send mail
                            await mailTransporter.sendMail(getSignupMailOptions(token, uid, host, name, email));
                            await query("INSERT INTO unverified_users(uid, token) VALUES(?,?)", [uid, token]);
                            await query(sqlinsertquery, sqldata);
                            
                            req.flash('success', 'Check your email!');
                            res.redirect('/');
                            return next();
                        } else {
                            req.flash('failure', RESULT_CODES.EMAIL_INCORRECT);
                        }
                    } catch(e) {
                        console.log(e);
                        req.flash('failure', RESULT_CODES.UNKNOWN_ERROR);
                    }
                }else {
                    req.flash('failure', RESULT_CODES.EMAIL_INCORRECT);
                }
            }else {
                req.flash('failure', RESULT_CODES.ALPHANUMERIC_CHARS);
            }
        }else {
            req.flash('failure', RESULT_CODES.PASS_ERR);
        }

        
        res.redirect('/sign-up');
        return next();
    },

    verify: async (req, res) => {
        if(req.query.uid === undefined || req.query.token === undefined)
            throw new Error("Request error! Missing uid or token.");
        
        uid = req.query.uid;
        token = req.query.token;

        try {
            let data = await query("SELECT id FROM unverified_users WHERE uid = ? AND token = ?", [uid, token]);

            if(data.length > 0) {
                await query("UPDATE users SET verified=true WHERE uid = ?", uid);
                await query("DELETE FROM unverified_users WHERE uid = ?", uid);
                
                req.flash('success', "Successfully verified!");
                return res.redirect('/');;
            }
        } catch(e) {
            console.log(e.message);
        }

        req.flash('failure', "Could not verify email!");
        return res.redirect('/');
    },

    sendResetPasswordMail: async (req, res) => {
        if(req.body.email === undefined) {
            res.render('reset-pass', {failure: "No email inserted!"});
            return;
        }

        email = req.body.email;
        host = req.headers.host;

        try {
            let data = await query("SELECT firstname, uid, verified FROM users WHERE email = ?", email);

            if(data.length > 0) {
                if(data[0].verified) {
                        token = generateToken();
                        await mailTransporter.sendMail(getPassResetMailOptions(token, data[0].uid, host, data[0].firstname, email));
                        await query("INSERT INTO reset_pass(uid, token) VALUES(?,?)", [data[0].uid, token]);
                        
                        req.flash('success', "Check your inbox!");
                        return res.redirect('/');
                    }
                }
                else {
                    req.flash('failure', "Account is not verified!");
            }
        } catch(e) {
            console.log(e);
            req.flash('failure', RESULT_CODES.UNKNOWN_ERROR);
        }

        res.render('reset-pass', {failure: req.flash('failure')[0]});
    },

    resetPassword: async (req, res) => {
        if(req.body.token === undefined || req.body.uid === undefined 
            || req.body.password === undefined || req.body.verify_password === undefined) {
            res.render('new-password', {failure: "Cannot change password!"});
            return;
        }

        token = req.body.token;
        uid = req.body.uid;
        password = req.body.password;
        verify_password = req.body.verify_password;

        try {
            if(password === verify_password) {
                let result = await query("SELECT token FROM reset_pass WHERE uid = ?", uid);

                if(result.length > 0 && result[0].token === token) {
                    await query("UPDATE users SET password=? WHERE uid = ?", [hashPass(password), uid]);
                    await query("DELETE FROM reset_pass WHERE uid = ?", uid);

                    req.flash('success', "Password successfully changed!");
                    return res.redirect('/');
                }
            }
        } catch(e) {
            console.log(e);
        }

        res.render('new-password', {failure: "Could not reset password! Make sure they match!", token : req.body.token, uid: req.body.uid});
    },
    
    RESULT_CODES: RESULT_CODES
};

module.exports = methods;