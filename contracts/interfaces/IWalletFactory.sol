//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

interface IWalletFactory {
    event WalletCreated(address indexed addr, bytes32 name);

    function createWallet(bytes32 _name) external returns (address);
}
