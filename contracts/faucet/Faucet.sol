// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Faucet {
    // Contract creator
    address public _creator;

    // Max withdraw amount by default
    uint public constant _maxWithdrawAmount = 5 ether;

    // Max withdraw interval blocks
    uint public constant _maxWithdrawInterval = 28800;

    // Withdraw interval blocks
    uint public _withdrawInterval = 1200;

    // Banned recipient map
    mapping(address => bool) public _bannedRecipientMap;

    // Banned recipient list
    address[] public _bannedRecipientList;

    // Operator map
    mapping(address => bool) public _operatorMap;

    // Last withdraw block number map
    mapping(address => uint) public _lastWithdrawBlockNumberMap;

    // Operator list
    address[] public _operatorList;

    // Withdraw event
    event Withdraw(uint indexed blockNumber, address indexed recipient, uint256 amount);

    // BanRecipient event
    event BanRecipient(address indexed recipient);

    // UnbanRecipient event
    event UnbanRecipient(address indexed recipient);

    // AddOperator event
    event AddOperator(address indexed operator);

    // RemoveOperator event
    event RemoveOperator(address indexed operator);

    modifier onlyCreator() {
        require(msg.sender == _creator, "invalid sender");
        _;
    }

    modifier onlyOperator() {
        require(_operatorMap[msg.sender], "invalid operator");
        _;
    }

    modifier onlyRecipientNotBanned(address recipient) {
        require(!_bannedRecipientMap[recipient], "recipient already banned");
        _;
    }

    modifier onlyRecipientBanned(address recipient) {
        require(_bannedRecipientMap[recipient], "recipient not banned");
        _;
    }

    modifier onlyOperatorNotExist(address operator) {
        require(!_operatorMap[operator], "operator already exist");
        _;
    }

    modifier onlyOperatorExist(address operator) {
        require(_operatorMap[operator], "operator not exist");
        _;
    }

    constructor() {
        _creator = msg.sender;
        addOperator(msg.sender);
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}

    // Ban recipient
    function banRecipient(address recipient) public onlyCreator onlyRecipientNotBanned(recipient) {
        _bannedRecipientMap[recipient] = true;
        _bannedRecipientList.push(recipient);

        emit BanRecipient(recipient);
    }

    // Unban recipient
    function unbanRecipient(address recipient) public onlyCreator onlyRecipientBanned(recipient) {
        _bannedRecipientMap[recipient] = false;
        removeRecipientFromBannedList(recipient);

        emit UnbanRecipient(recipient);
    }

    function removeRecipientFromBannedList(address recipient) private {
        for (uint256 i = 0; i < _bannedRecipientList.length; i++) {
            if (_bannedRecipientList[i] == recipient) {
                address last = _bannedRecipientList[_bannedRecipientList.length - 1];
                _bannedRecipientList[i] = last;
                _bannedRecipientList.pop();
                break;
            }
        }
    }

    // Get banned recipient list
    function getBannedRecipientList() public view returns (address[] memory) {
        return _bannedRecipientList;
    }

    // Add operator
    function addOperator(address operator) public onlyCreator onlyOperatorNotExist(operator) {
        _operatorMap[operator] = true;
        _operatorList.push(operator);

        emit AddOperator(operator);
    }

    // Remove operator
    function removeOperator(address operator) public onlyCreator onlyOperatorExist(operator) {
        _operatorMap[operator] = false;
        removeOperatorFromList(operator);

        emit RemoveOperator(operator);
    }

    function removeOperatorFromList(address operator) private {
        for (uint256 i = 0; i < _operatorList.length; i++) {
            if (_operatorList[i] == operator) {
                address last = _operatorList[_operatorList.length - 1];
                _operatorList[i] = last;
                _operatorList.pop();
                break;
            }
        }
    }

    // Get operator list
    function getOperatorList() public view returns (address[] memory) {
        return _operatorList;
    }

    // Set withdraw interval
    function setWithdrawInterval(uint interval) public onlyCreator {
        require(interval > 0 && interval < _maxWithdrawInterval, "invalid interval, it should be in the range (0,28800]");

        _withdrawInterval = interval;
    }

    // Withdraw
    function withdraw(address payable recipient, uint256 amount) public onlyOperator onlyRecipientNotBanned(recipient) {
        require(amount > 0 && amount <= _maxWithdrawAmount, "invalid amount, it should be in the range (0,5]");
        require(recipient != address(0), "zero address is invalid");
        require(address(this).balance > amount, "insufficient faucet balance");
        require(block.number - _lastWithdrawBlockNumberMap[recipient] >= _withdrawInterval, "withdraw is not available at the current block height");

        recipient.transfer(amount);
        _lastWithdrawBlockNumberMap[recipient] = block.number;

        emit Withdraw(block.number, recipient, amount);
    }
}
