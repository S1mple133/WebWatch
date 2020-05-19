const Web3 = require("web3");
const hashlib = require('./hashlib');
const HDWalletProvider = require('truffle-hdwallet-provider');
const { interface } = require('../compile');
const fs = require('fs');
const util = require('util');
const path = require('path');
const readFile = util.promisify(fs.readFile);

const CONTRACT_ADDR = "0xF12B84777731751ce70EF2125c93bc3c3FE06ad2"; // Deployed contract address

const provider = new HDWalletProvider(
    // Account mnemonics
    'recipe submit horror approve bargain used pretty orient recycle put meadow crash',
    // Link to connect to to deploy
    'https://rinkeby.infura.io/v3/486b5f156a244fedb0a6c3056b66eaa5'
);

const web3 = new Web3(provider);
var contract = new web3.eth.Contract(JSON.parse(interface), CONTRACT_ADDR);
const address = "0x9720E8EA7aD42c8d3CE8671b7271E6E7Ef41695b";
const privateKey = "E018D766E4A1ED365EB8EB9B6F8D0DDE12BF4FCE1107FB88DD8F34197D3F9970";

async function saveHashToEth(hash, email) {
    const accountNonce = await web3.eth.getTransactionCount(address);

    const tx = {
        from: address,
        to: CONTRACT_ADDR,
        data: contract.methods.addHash(hash, email).encodeABI(),
        gas: 1000000,
        nonce: accountNonce
    };

    const signPromise = await web3.eth.accounts.signTransaction(tx, privateKey);

    const sentTx = await web3.eth.sendSignedTransaction(signPromise.rawTransaction)
        //.then(receipt => console.log("Transaction receipt: ", receipt))  .catch(err => console.error(err))
        .then(receipt => console.log("added: "+ hash))  .catch(err => console.error(err));
}

getHashesOfPerson = async (email) => await contract.methods.getHashes(email).call();

async function getHashesOfPersonJSON(email) {
    hashes = await contract.methods.getHashes(email).call();

    var websites = {};
    for(var i = 0; i  < hashes.length;i++) {
        const metafile = "./data/"+hashes[i]+"/"+ hashlib.meta_file_name;
        const file_exists = fs.existsSync(metafile);
        websites[i] = 
        {
            website: file_exists? await readFile(metafile) : "Manipulation Error",
            hash: hashes[i],
            html: path.join("/data", path.join(hashes[i], "index.html")),
            pdf:  path.join("/data", path.join(hashes[i], "index.pdf"))
        };
    }

    return websites;
}

exports.saveHashToEth = saveHashToEth;
exports.getHashesOfPersonJSON = getHashesOfPersonJSON;