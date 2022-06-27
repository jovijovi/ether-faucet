// SPDX-License-Identifier: MIT
// Faucet Permission Control Contract v0.2.1
pragma solidity ^0.8.4;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

abstract contract PermissionControl is Ownable {
    /**
     * @dev Operator map.
     */
    mapping(address => bool) private _operatorMap;

    /**
     * @dev Operator list.
     */
    address[] private _operatorList;

    /**
     * @dev Banned recipient map.
     */
    mapping(address => bool) private _bannedRecipientMap;

    /**
     * @dev Banned recipient list.
     */
    address[] private _bannedRecipientList;

    /**
     * @dev Emitted when add an operator.
     */
    event AddOperator(address indexed operator);

    /**
     * @dev Emitted when remove an operator.
     */
    event RemoveOperator(address indexed operator);

    /**
     * @dev Emitted when add ban recipient.
     */
    event BanRecipient(address indexed recipient);

    /**
     * @dev Emitted when add unban recipient.
     */
    event UnbanRecipient(address indexed recipient);

    /**
     * @dev Throws if called by any account other than the operator.
     */
    modifier onlyOperator() {
        require(_operatorMap[_msgSender()], "PermissionControl: invalid operator");
        _;
    }

    /**
     * @dev Throws if the operator already exist.
     */
    modifier onlyOperatorNotExist(address operator) {
        require(!_operatorMap[operator], "PermissionControl: operator already exist");
        _;
    }

    /**
     * @dev Throws if the operator not exist.
     */
    modifier onlyOperatorExist(address operator) {
        require(_operatorMap[operator], "PermissionControl: operator not exist");
        _;
    }

    /**
     * @dev Throws if the recipient already banned.
     */
    modifier onlyRecipientNotBanned(address recipient) {
        require(!_bannedRecipientMap[recipient], "Faucet: recipient already banned");
        _;
    }

    /**
     * @dev Throws if the recipient not banned.
     */
    modifier onlyRecipientBanned(address recipient) {
        require(_bannedRecipientMap[recipient], "Faucet: recipient not banned");
        _;
    }

    /**
     * @dev Initializes the contract setting default operator as the initial owner.
     */
    constructor() {
        addOperator(_msgSender());
    }

    /**
     * @dev Get operator list.
     */
    function getOperatorList() public view returns (address[] memory) {
        return _operatorList;
    }

    /**
     * @dev Get operator list length.
     */
    function getOperatorListLength() public view returns (uint) {
        return _operatorList.length;
    }

    /**
     * @dev Check if it is the operator address.
     */
    function isOperator(address operator) public view returns (bool) {
        return _operatorMap[operator];
    }

    /**
     * @dev Add operator.
     */
    function addOperator(address operator) public onlyOwner onlyOperatorNotExist(operator) {
        _operatorMap[operator] = true;
        _operatorList.push(operator);

        emit AddOperator(operator);
    }

    /**
     * @dev Add operators.
     */
    function addOperators(address[] memory operators) public onlyOwner {
        require(operators.length > 0, "PermissionControl: no operators");
        for (uint256 i = 0; i < operators.length; i++) {
            require(!_operatorMap[operators[i]], "PermissionControl: operator already exist");
            _operatorMap[operators[i]] = true;
            _operatorList.push(operators[i]);
            emit AddOperator(operators[i]);
        }
    }

    /**
     * @dev Remove operator.
     */
    function removeOperator(address operator) public onlyOwner onlyOperatorExist(operator) {
        _operatorMap[operator] = false;
        _removeOperatorFromList(operator);

        emit RemoveOperator(operator);
    }

    /**
     * @dev Operator retire.
     */
    function retire() public onlyOperator {
        _operatorMap[_msgSender()] = false;
        _removeOperatorFromList(_msgSender());

        emit RemoveOperator(_msgSender());
    }

    /**
     * @dev Remove operator from list.
     */
    function _removeOperatorFromList(address operator) private {
        for (uint256 i = 0; i < _operatorList.length; i++) {
            if (_operatorList[i] == operator) {
                address last = _operatorList[_operatorList.length - 1];
                _operatorList[i] = last;
                _operatorList.pop();
                break;
            }
        }
    }

    /**
     * @dev Get banned recipient list.
     */
    function getBannedRecipientList() public view returns (address[] memory) {
        return _bannedRecipientList;
    }

    /**
     * @dev Get banned recipient list length.
     */
    function getBannedRecipientListLength() public view returns (uint) {
        return _bannedRecipientList.length;
    }

    /**
     * @dev Check if the recipient address is banned.
     */
    function isBanned(address recipient) public view returns (bool) {
        return _bannedRecipientMap[recipient];
    }

    /**
     * @dev Ban recipient.
     */
    function banRecipient(address recipient) public onlyOwner onlyRecipientNotBanned(recipient) {
        _bannedRecipientMap[recipient] = true;
        _bannedRecipientList.push(recipient);

        emit BanRecipient(recipient);
    }

    /**
     * @dev Unban recipient.
     */
    function unbanRecipient(address recipient) public onlyOwner onlyRecipientBanned(recipient) {
        _bannedRecipientMap[recipient] = false;
        _removeRecipientFromBannedList(recipient);

        emit UnbanRecipient(recipient);
    }

    /**
     * @dev Remove recipient from banned list.
     */
    function _removeRecipientFromBannedList(address recipient) private {
        for (uint256 i = 0; i < _bannedRecipientList.length; i++) {
            if (_bannedRecipientList[i] == recipient) {
                address last = _bannedRecipientList[_bannedRecipientList.length - 1];
                _bannedRecipientList[i] = last;
                _bannedRecipientList.pop();
                break;
            }
        }
    }
}
