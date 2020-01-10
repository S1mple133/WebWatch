const Web3 = require("web3");
const HDWalletProvider = require('truffle-hdwallet-provider');
const { interface } = require('../compile');
const CONTRACT_ADDR = "0xe0536342c32217DB992FCCfc68dADCeA4E2181b1"; // Deployed contract address

const provider = new HDWalletProvider(
    // Account mnemonics
    'recipe submit horror approve bargain used pretty orient recycle put meadow crash',
    // Link to connect to to deploy
    'https://rinkeby.infura.io/v3/486b5f156a244fedb0a6c3056b66eaa5'
);
const web3 = new Web3(provider);
var contract = new web3.eth.Contract(JSON.parse(interface), CONTRACT_ADDR);

async function saveHashToEth(address, privateKey, hash) {
    const accountNonce = await web3.eth.getTransactionCount(address);

    const tx = {
        from: address,
        to: CONTRACT_ADDR,
        data: contract.methods.addHash(hash).encodeABI(),
        gas: 1000000,
        nonce: accountNonce
    };

    const signPromise = await web3.eth.accounts.signTransaction(tx, privateKey);
    //console.log(signPromise);
    const sentTx = await web3.eth.sendSignedTransaction(signPromise.rawTransaction)
        .then(receipt => console.log("Transaction receipt: ", receipt))  .catch(err => console.error(err));
}

async function getHashesOfPerson(address, cb) {
    hashes = await contract.methods.getHashes(address).call();
    cb(hashes);
}
async function getHashesOfPersonJSON(address, cb) {
    hashes = await contract.methods.getHashes(address).call();

    var websites = {};
    for(var i = 0; i  < hashes.length;i++) {
        websites[i] = 
        {
            website: "example.com",
            hash: hashes[i],
            html: hashes[i] + "/index.html",
            pdf:  hashes[i] + "/index.pdf"
        };
    }
    cb(websites);
}

//saveHashToEth("0x9720E8EA7aD42c8d3CE8671b7271E6E7Ef41695b",
 //   "E018D766E4A1ED365EB8EB9B6F8D0DDE12BF4FCE1107FB88DD8F34197D3F9970",
 //   "a7b0f053b02be51398a00cbf668acf5e");

exports.saveHashToEth = saveHashToEth;
exports.getHashesOfPersonJSON = getHashesOfPersonJSON;