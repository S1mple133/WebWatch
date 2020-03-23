pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

contract HashStorage {
    mapping(string => string[]) people;

    function addHash(string hash, string email) public {
        people[email].push(hash);
    }

    // SHOULD HASHES BE AVAILABLE TO EVERYONE
    // -- Call + owner parameter (Or should they only be availabe to owner - Transaction)
    function getHashes(string owner) public returns(string[]) {
        return people[owner];
    }
}