var mysql = require('mysql');
var util = require('util');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "webwatch"
});

exports.query = util.promisify(con.query).bind(con);