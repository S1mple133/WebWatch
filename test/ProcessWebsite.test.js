const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { interface, bytecode} = require('../compile');

describe('ProcessWebsite', function() {
    let accounts;
    let hashStorage;

    beforeEach(async function() {
        accounts = await web3.eth.getAccounts();

        // Deploy contract
        hashStorage = await new web3.eth.Contract(JSON.parse(interface))
            .deploy({
                data: bytecode
            })
            .send( {
                from: accounts[0],
                gas: '1000000'
            });

    });

    it('deploys the contract', () => {
        assert.ok(hashStorage.options.address);
    });

    it('addHash with one hash', async function() {
        await hashStorage.methods.addHash("a7b0f053b02be51398a00cbf668acf5e").send( { from: accounts[0] });
        assert.equal("a7b0f053b02be51398a00cbf668acf5e", (await hashStorage.methods.getHashes(accounts[0]).call())[0]);
    });

    it('addHash with more hashes', async function() {
        await hashStorage.methods.addHash("a7b0f053b02be51398a00cbf668acf5e").send( { from: accounts[0] });
        await hashStorage.methods.addHash("hello").send( { from: accounts[0] });
        hashes = (await hashStorage.methods.getHashes(accounts[0]).call());
        assert.equal("a7b0f053b02be51398a00cbf668acf5e", hashes[0]);
        assert.equal("hello", hashes[1]);
    });

    it('addHash with one hash from 2 users', async function() {
        await hashStorage.methods.addHash("a7b0f053b02be51398a00cbf668acf5e").send( { from: accounts[0] });
        await hashStorage.methods.addHash("hello").send( { from: accounts[1] });
        assert.equal("a7b0f053b02be51398a00cbf668acf5e", (await hashStorage.methods.getHashes(accounts[0]).call())[0]);
        assert.equal("hello", (await hashStorage.methods.getHashes(accounts[1]).call())[0]);
    });

    it('addHash with more hashes from 2 users', async function() {
        await hashStorage.methods.addHash("a7b0f053b02be51398a00cbf668acf5e").send( { from: accounts[0] });
        await hashStorage.methods.addHash("hello0").send( { from: accounts[0] });
        await hashStorage.methods.addHash("hello").send( { from: accounts[1] });
        await hashStorage.methods.addHash("hello1").send( { from: accounts[1] });
        hashes0 = (await hashStorage.methods.getHashes(accounts[0]).call());
        hashes1 = (await hashStorage.methods.getHashes(accounts[1]).call());
        assert.equal("a7b0f053b02be51398a00cbf668acf5e", hashes0[0]);
        assert.equal("hello0", hashes0[1]);
        assert.equal("hello", hashes1[0]);
        assert.equal("hello1", hashes1[1]);
    });
});