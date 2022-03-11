//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "./interfaces/IWalletController.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract WalletController is IWalletController, Ownable {
    mapping(bytes32 => address) private nameToAddress;

    function getAddressByName(bytes32 _name)
        external
        view
        override
        returns (address)
    {
        return nameToAddress[_name];
    }

    function checkAvailability(bytes32 _name)
        public
        view
        override
        returns (bool)
    {
        if (nameToAddress[_name] != address(0)) return false;
        return true;
    }

    function setName(bytes32 _name, address _addr) external override {
        require(checkAvailability(_name), "Name already been used");
        nameToAddress[_name] = _addr;
    }
}
