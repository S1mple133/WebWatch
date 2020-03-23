const path = require('path');
const fs = require('fs');
const solc = require('solc');

const inboxPath = path.resolve(__dirname, 'contracts', 'HashStorage.sol');
const source = fs.readFileSync(inboxPath).toString();

let exportVal = solc.compile(source, 1).contracts[':HashStorage'];
process.removeAllListeners("uncaughtException");

module.exports = exportVal;