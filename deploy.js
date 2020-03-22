const Web3 = require("web3");
const HDWalletProvider = require('truffle-hdwallet-provider');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
    // Account mnemonics
    'recipe submit horror approve bargain used pretty orient recycle put meadow crash',
    // Link to connect to to deploy
    'https://rinkeby.infura.io/v3/486b5f156a244fedb0a6c3056b66eaa5'
);
const web3 = new Web3(provider);

async function deploy() {
    const accounts = await web3.eth.getAccounts();

    console.log("Attempting to deploy from account ", accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({data: '0x' + bytecode}) // add 0x bytecode
        .send({from: accounts[0]}); // remove 'gas'

    console.log("Console deployed to", result.options.address);
}

deploy();