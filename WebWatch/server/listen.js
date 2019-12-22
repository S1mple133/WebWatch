var fs = require('fs');
var express = require('express');
var app = express();
const hashlib = require('../lib/hashlib');
var url = require('url');

//listener
app.post('/', function (req, res) {
    req.on('data', function (data) {
        var parsed = url.parse("http://localhost/index.php?" + data, true).query;

        hashlib.saveUrlData(parsed.url, function (hash) {
            console.log(hash);
        });
    });

    res.writeHead(200);
    res.end();
});

var http = require('http');
http.createServer(app).listen(8000);