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
    hash.setEncoding('hex');
    hash.write(html);
    hash.end();

    return hash.read();
}

async function saveUrlData(url, email) {
    html = await getHtmlCodeOfLink(url);
    hash = getHashOfCode(html);

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
