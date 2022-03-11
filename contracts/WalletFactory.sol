//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./interfaces/IWalletFactory.sol";
import "./interfaces/IWalletController.sol";
import "./interfaces/IWallet.sol";

contract WalletFactory is IWalletFactory {
    address public walletImplementation;
    IWalletController private controller;

    constructor(address _impl, address _controller) {
        walletImplementation = _impl;
        controller = IWalletController(_controller);
    }

    function createWallet(bytes32 _name)
        external
        override
        returns (address wallet)
    {
        require(controller.checkAvailability(_name), "Name already been used");
        bytes32 salt = keccak256(abi.encodePacked(_name));
        wallet = Clones.cloneDeterministic(walletImplementation, salt);
        IWallet(wallet).initialize(_name, address(controller), msg.sender);
        controller.setName(_name, wallet);
        emit WalletCreated(wallet, _name);
    }
}
