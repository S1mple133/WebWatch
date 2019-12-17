pragma experimental ABIEncoderV2;
pragma solidity ^0.4.25;

contract HashStorage {
    mapping(address => string[]) people;

    function addHash(string hash) public {
        people[msg.sender].push(hash);
    }

    // SHOULD HASHES BE AVAILABLE TO EVERYONE
    // -- Call + owner parameter (Or should they only be availabe to owner - Transaction)
    function getHashes(address owner) public returns(string[]) {
        return people[owner];
    }
}