var mysql = require('mysql');
const util = require('util');

const RESULT_CODES = {
    OK: 'Success!',
    EMAIL_INCORRECT: 'Email has wrong syntax or is already used.',
    PASS_ERR : 'Password is weak or passwords don\'t match.',
    ALPHANUMERIC_CHARS:'Last name and Name should only contain alphanumeric characters.',
    UNKNOWN_ERROR:'Failed! Try again later.'
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

var methods = {
    signup: async function(req) {
        //name and lastname alphabetical
        //email has correct syntax
        //check if email in use
        
        const name = req.body.first_name;
        const lastname = req.body.last_name;
        const email = req.body.email;
        const pw = req.body.password;
        const repeat_pw = req.body.repeat_password;
        if(pw == repeat_pw) {
            if(/^[a-zA-Z]+$/.test(name) && /^[a-zA-Z]+$/.test(lastname)) {
                if(validateEmail(email)) {
                    try {
                        let res = await query("SELECT email FROM users WHERE email = ?", email);
                        if(res.length == 0) {
                            const sqlinsertquery = "INSERT INTO users (firstname, lastname, email,password) values(?, ?, ?, ?)";
                            const sqldata = [name, lastname, email, pw];
                            try {
                                res = await query(sqlinsertquery, sqldata);
                                return RESULT_CODES.OK;
                            } catch(e) {
                                return RESULT_CODES.UNKNOWN_ERROR;
                            }
                        }else {
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

    login: function(email, pass) {

    },
    
    RESULT_CODES: RESULT_CODES
};

module.exports = methods;