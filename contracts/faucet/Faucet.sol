// SPDX-License-Identifier: MIT
// Faucet Contract v0.2.0
pragma solidity ^0.8.4;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "./Permission.sol";

contract Faucet is ReentrancyGuard, Ownable, PermissionControl {
    /**
     * @dev Max withdraw amount by default.
     */
    uint private constant _maxWithdrawAmount = 5 ether;

    /**
     * @dev Max withdraw interval blocks.
     */
    uint private constant _maxWithdrawInterval = 28800;

    /**
     * @dev Withdraw interval blocks.
     */
    uint private _withdrawInterval = 1200;

    /**
     * @dev Last withdraw block number map
     */
    mapping(address => uint) private _lastWithdrawBlockNumberMap;

    /**
     * @dev Withdraw event.
     */
    event Withdraw(uint indexed blockNumber, address indexed recipient, uint256 amount);

    constructor() {
    }

    /**
     * @dev The contract should be able to receive Ether.
     * The receive function is executed on a call to the contract with empty calldata.
     */
    receive() external payable {}

    /**
     * @dev This function is called for all messages sent to this contract, except plain Ether transfers
     * (there is no other function except the receive function). Any call with non-empty calldata to this contract
     * will execute the fallback function (even if Ether is sent along with the call).
     */
    fallback() external payable {}

    /**
     * @dev Set withdraw interval.
     */
    function setWithdrawInterval(uint interval) public onlyOwner {
        require(interval > 0 && interval < _maxWithdrawInterval, "Faucet: invalid interval, it should be in the range (0,28800]");

        _withdrawInterval = interval;
    }

    /**
     * @dev Get withdraw interval.
     */
    function getWithdrawInterval() public view returns (uint) {
        return _withdrawInterval;
    }

    /**
     * @dev Get last withdraw block number.
     */
    function getLastWithdrawBlockNumber(address recipient) public view returns (uint) {
        return _lastWithdrawBlockNumberMap[recipient];
    }

    /**
     * @dev Withdraw.
     */
    function withdraw(address payable recipient, uint256 amount) public nonReentrant onlyOperator onlyRecipientNotBanned(recipient) {
        require(amount > 0 && amount <= _maxWithdrawAmount, "Faucet: invalid amount, it should be in the range (0,5]");
        require(recipient != address(0), "Faucet: zero address is invalid");
        require(recipient != address(this), "Faucet: invalid address, cannot withdraw to the Faucet contract itself");
        require(amount <= address(this).balance, "Faucet: insufficient faucet balance");
        require(block.number - _lastWithdrawBlockNumberMap[recipient] >= _withdrawInterval, "Faucet: withdraw is not available at the current block height");

        recipient.transfer(amount);
        _lastWithdrawBlockNumberMap[recipient] = block.number;

        emit Withdraw(block.number, recipient, amount);
    }
}
