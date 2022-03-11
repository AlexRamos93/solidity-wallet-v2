//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

interface IWallet {
    function initialize(
        bytes32 _name,
        address _controller,
        address _owner
    ) external;

    function getBalance(address _token) external view returns (uint256);

    function getAllBalances(address[] memory _tokens)
        external
        view
        returns (uint256[] memory balances);
}
