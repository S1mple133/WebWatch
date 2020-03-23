var mysql = require('mysql');
const util = require('util');
var bcrypt = require('bcrypt');

const RESULT_CODES = {
    OK: 'Success!',
    EMAIL_INCORRECT: 'Email has wrong syntax or is already used.',
    PASS_ERR : 'Password is weak or passwords don\'t match.',
    ALPHANUMERIC_CHARS:'Last name and Name should only contain alphanumeric characters.',
    UNKNOWN_ERROR:'Failed! Try again later.',
    LOGIN_FAILED: 'There was a problem while logging in!',
    NOT_AUTHENTICATED: "You have to log in to perform that action!"
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
    signup: async function(name, lastname, email, pw, repeat_pw) {

        if(pw == repeat_pw) {
            if(/^[a-zA-Z]+$/.test(name) && /^[a-zA-Z]+$/.test(lastname)) {
                if(validateEmail(email)) {
                    try {
                        let res = await query("SELECT email FROM users WHERE email = ?", email);

                        if(res.length == 0) {
                            const sqlinsertquery = "INSERT INTO users (firstname, lastname, email,password) values(?, ?, ?, ?)";
                            const sqldata = [name, lastname, email, bcrypt.hashSync(pw, bcrypt.genSaltSync())];

                            res = await query(sqlinsertquery, sqldata);
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

    login: async function(req) {
        const email = req.body.email;
        const password = req.body.password;

        try {
            let res = await query("SELECT * FROM users WHERE email = ?", email);

            if(res.length > 0 && bcrypt.compareSync(password, res[0].password)) {
                req.session.firstname = res[0].firstname;
                req.session.lastname = res[0].lastname;
                req.session.email = res[0].email;
                return RESULT_CODES.OK;
            }

        } catch(e){
            console.log(e);
        }

        return RESULT_CODES.LOGIN_FAILED;
    },
    
    RESULT_CODES: RESULT_CODES
};

module.exports = methods;