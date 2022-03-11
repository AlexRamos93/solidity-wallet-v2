//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "./interfaces/IWallet.sol";
import "./interfaces/IWalletController.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "hardhat/console.sol";

contract Wallet is IWallet {
    bytes32 public name;
    address public factory;
    address public owner;
    IWalletController private controller;

    event Transfered(bytes32 recepient, uint256 amount, address token);

    constructor() {
        factory = address(0xdead);
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    // called once by the factory at time of deployment
    function initialize(
        bytes32 _name,
        address _controller,
        address _onwer
    ) external override {
        require(factory == address(0), "Wallet: Unauthorized");
        factory = msg.sender;
        name = _name;
        controller = IWalletController(_controller);
        owner = _onwer;
    }

    function getBalance(address _token)
        external
        view
        override
        onlyOwner
        returns (uint256)
    {
        return IERC20(_token).balanceOf(address(this));
    }

    function getAllBalances(address[] memory _tokens)
        external
        view
        override
        onlyOwner
        returns (uint256[] memory)
    {
        uint256 tokensLength = _tokens.length;
        uint256[] memory balances = new uint256[](tokensLength);
        for (uint256 i = 0; i < tokensLength; ) {
            balances[i] = IERC20(_tokens[i]).balanceOf(address(this));
            unchecked {
                i++;
            }
        }
        return balances;
    }

    function transfer(
        bytes32 _recepient,
        uint256 _amount,
        address _token
    ) external onlyOwner {
        address recepientAddr = controller.getAddressByName(_recepient);
        require(recepientAddr != address(0), "Wallet: User not found");
        IERC20(_token).transfer(recepientAddr, _amount);
        emit Transfered(_recepient, _amount, _token);
    }
}
