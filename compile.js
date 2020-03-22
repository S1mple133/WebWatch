const path = require('path');
const fs = require('fs');
const solc = require('solc');

const inboxPath = path.resolve(__dirname, 'contracts', 'HashStorage.sol');
const source = fs.readFileSync(inboxPath).toString();

module.exports = solc.compile(source, 1).contracts[':HashStorage'];