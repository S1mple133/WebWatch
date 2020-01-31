const fs = require('fs');
const crypto = require('crypto');
const rp = require('request-promise');
const puppeteer = require('puppeteer');
const ethlib = require('./ethlib');
var express = require('express');
const dir_root = "../data";
const html_file_name = "index.html";
const pdf_file_name = "index.pdf";
const meta_file_name = "metafile";
const Web3 = require("web3");
const web3 = new Web3();

        /*
           Callback with html code passed as argument
         */
    function getHtmlCodeOfLink(link, cb) {
        rp(link)
            .then(function (html) {
                cb(html);
            })
            .catch(function (err) {
                console.log(err);
            });
    }

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

    function saveUrlData(address, privateKey, url, cb) {
        getHtmlCodeOfLink(url, function (html) {
            hash = getHashOfCode(html);
            const folder = dir_root + '/' + hash + '/';

            if (fs.existsSync(folder)) {
                //console.log("Hash already Exists !");
                return;
            }
            fs.mkdirSync(folder);

            (async () => {
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                await page.goto(url, {waitUntil: 'networkidle2'});
                await page.pdf({path: folder + pdf_file_name});

                await browser.close();
            })();

            fs.writeFile(folder + html_file_name, html, (err) => {
                if (err) throw err;
            });
            fs.writeFile(folder + meta_file_name, url, (err) => {
                if (err) throw err;
            });
            
            ethlib.saveHashToEth(address,privateKey,hash);
            //console.log("added: "+ url);
            cb(hash);
        });
    }

exports.saveUrlData = saveUrlData;
exports.meta_file_name = meta_file_name;
