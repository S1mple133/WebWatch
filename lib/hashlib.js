const fs = require('fs');
var path = require("path");
const crypto = require('crypto');
const rp = require('request-promise');
const puppeteer = require('puppeteer');
const ethlib = require('./ethlib');
var express = require('express');
const dir_root = __dirname + path.sep + ".." + path.sep + "data";
const html_file_name = "index.html";
const pdf_file_name = "index.pdf";
const meta_file_name = "metafile";
const Web3 = require("web3");
const web3 = new Web3();
var request = require('sync-request');

/*
Callback with html code passed as argument
*/
getHtmlCodeOfLink = async (link) => await rp(link);

/*
Callback with hash passed as argument
*/
function getHashOfFile(file, cb) {
    var hash = crypto.createHash('md5');
    var file = fs.ReadStream(output_file_name);

    // Read data from file and get hash
    file.on('data', function (actData) {
        hash.update(actData);
    });
    file.on('end', function () {
        cb(hash.digest('hex'));
    });
}

/*
Callback with hash passed as argument
*/
function getHashOfCode(html) {
    var hash = crypto.createHash('md5');
    //hash.setEncoding('hex');
    hash.setEncoding('hex');
    hash.write(html);
    hash.end();
    
    return hash.read();
}
//98E34BFA1CB60354A1B5D30CE59BA2D1
//fbaa678d9cb0e813d0d1aff84aa1ad98

function getHashUsingAPI(url) {
    var res = request('GET', 'http://localhost:5002/GetClientHashes/'+encodeURIComponent(url));
    var hashes = JSON.parse(res.getBody('utf8'));
    return hashes;
}

//getHashUsingAPI("https://google.com");

async function saveUrlData(url, email) {
    //hash = getHashOfCode(html);
    clientHashes = getHashUsingAPI(url);

    if(Object.keys(clientHashes).length != 1) {
        //return -1;
        throw "Client hashes don't agree.";
    }
    html = await getHtmlCodeOfLink(url);
    hash = JSON.parse(Object.keys(clientHashes)[0]).hash;

    //user saves example.com
    //clients example.com

    if(getHashOfCode(html) != hash) {
        throw "Server html hash doesn't agree with client hashes.";
    }
    const folder = dir_root + path.sep + hash + path.sep;
    
    if(!fs.existsSync(dir_root)) {
        fs.mkdirSync(dir_root);
    }
    
    if (!fs.existsSync(folder)) {
        // If folder already exists, hash already exists.
        // Made by an other user. Only add the hash to the users profile
        fs.mkdirSync(folder);
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(url, {waitUntil: 'networkidle2'});
            await page.pdf({path: folder + pdf_file_name});

            await browser.close();

            fs.writeFileSync(folder + html_file_name, html);
            fs.writeFileSync(folder + meta_file_name, url);
    }
    
    await ethlib.saveHashToEth(hash, email);

    return hash;
}

exports.saveUrlData = saveUrlData;
exports.meta_file_name = meta_file_name;
exports.getHash = getHashOfCode;