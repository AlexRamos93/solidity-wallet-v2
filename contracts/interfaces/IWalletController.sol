//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

interface IWalletController {
    function getAddressByName(bytes32 _name) external view returns (address);

    function checkAvailability(bytes32 _name) external view returns (bool);

    function setName(bytes32 _name, address _addr) external;
}
