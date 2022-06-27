const {ethers} = require('hardhat');
import {expect} from 'chai';
import {Signer, Wallet} from 'ethers';
import {Confirmations, StatusSuccessful} from '../../src/contracts/faucet/abi/params';
import {Faucet, Faucet__factory} from '../../typechain-types';

describe("Faucet Contract", function () {
	const contractName = "Faucet";
	let contractAddress: string;

	let owner: Signer, signer1: Signer, signer2: Signer, signer3: Signer;
	let ownerAddress: string, signer1Address: string, signer2Address: string, signer3Address;

	async function getAccounts() {
		[owner, signer1, signer2, signer3] = await ethers.getSigners();

		ownerAddress = await owner.getAddress();
		console.debug("## ContractOwner=", ownerAddress);

		signer1Address = await signer1.getAddress();
		console.debug("## Address1=", signer1Address);

		signer2Address = await signer2.getAddress();
		console.debug("## Address2=", signer2Address);

		signer3Address = await signer3.getAddress();
		console.debug("## Address3=", signer3Address);
	}

	async function attachContract(name: string, address: string): Promise<Faucet> {
		const contractFactory = await ethers.getContractFactory(name);
		return contractFactory.attach(address);
	}

	function getWallet(pk: string): Wallet {
		return new Wallet(pk, ethers.provider);
	}

	async function connectContract(address: string): Promise<Faucet> {
		return Faucet__factory.connect(contractAddress, await ethers.getSigner(address));
	}

	before("tear up", async function () {
		await getAccounts();
	})

	// Deploy contract
	it("deploy", async function () {
		const contractFactory = await ethers.getContractFactory(contractName);
		const contract = await contractFactory.deploy();
		contractAddress = contract.address;
		owner = await contract.signer;
		console.debug("## Contract address=", contractAddress);
		console.debug("## Contract signer=", await contract.signer.getAddress());
		console.debug("## Contract owner=", await owner.getAddress());

		const tx = await owner.sendTransaction({
			to: contractAddress,
			value: ethers.utils.parseEther("100.0"), // Sends exactly 100 ether
		});
		const receipt = await tx.wait(Confirmations);
		expect(receipt.status).to.equal(StatusSuccessful);
		console.debug("## Send Ethers to contract(%s) completed, tx=%s, receipt=%o", contractAddress, receipt.transactionHash, receipt);
	})

	// Add mint operator
	it("addOperator", async function () {
		const contract = await attachContract(contractName, contractAddress);
		let operatorList = await contract.getOperatorList();
		console.debug("## OperatorList(Before add)=", operatorList);

		console.debug("## Adding operator(%s)...", signer1Address);
		const tx = await contract.addOperator(signer1Address);
		const receipt = await tx.wait(Confirmations);

		operatorList = await contract.getOperatorList();
		console.debug("## OperatorList(After add)=", operatorList);

		const isOperator = operatorList.includes(signer1Address);
		expect(isOperator).to.equal(true);

		console.debug("## Add operator(%s) completed, tx=", signer1Address, receipt.transactionHash);
	})

	// Withdraw by new operator
	it("withdrawByNewOperator", async function () {
		const contract = await connectContract(await signer1.getAddress());
		const lastWithdrawBlocknumber1 = await contract.getLastWithdrawBlockNumber(signer2Address);
		console.debug("## Last withdraw blocknumber(Before)=%d", lastWithdrawBlocknumber1);

		const tx = await contract.withdraw(signer2Address, 1);
		const receipt = await tx.wait(Confirmations);
		expect(receipt.status).to.equal(StatusSuccessful);

		const lastWithdrawBlocknumber2 = await contract.getLastWithdrawBlockNumber(signer2Address);
		console.debug("## Last withdraw blocknumber(After)=%d", lastWithdrawBlocknumber2);
		expect(receipt.blockNumber).to.equal(lastWithdrawBlocknumber2.toNumber());

		console.debug("## Withdraw by operator(%s) completed, tx=%s, receipt=%o", signer1Address, receipt.transactionHash, receipt);
	})

	// Withdraw again
	it("withdraw again", async function () {
		const contract = await connectContract(await signer1.getAddress());
		const lastWithdrawBlocknumber = await contract.getLastWithdrawBlockNumber(signer2Address);
		console.debug("## Last withdraw blocknumber=%d", lastWithdrawBlocknumber);
		try {
			await contract.withdraw(signer2Address, 1);
		} catch (e) {
			console.debug("## Expected error=%o", e.reason);
		}
	})

	// Remove mint operator
	it("removeOperator", async function () {
		const contract = await attachContract(contractName, contractAddress);
		let operatorList = await contract.getOperatorList();
		console.debug("## OperatorList(Before remove)=", operatorList);

		console.debug("## Removing operator(%s)...", signer1Address);
		const tx = await contract.removeOperator(signer1Address);
		const receipt = await tx.wait(Confirmations);

		operatorList = await contract.getOperatorList();
		console.debug("## OperatorList(After remove)=", operatorList);

		const isOperator = operatorList.includes(signer1Address);
		expect(isOperator).to.equal(false);

		console.debug("## Remove operator(%s) completed, tx=", signer1Address, receipt.transactionHash);
	})

	// Withdraw by removed operator
	it("withdrawByRemovedOperator", async function () {
		const contract = await connectContract(await signer1.getAddress());
		try {
			await contract.withdraw(signer2Address, 1);
		} catch (e) {
			console.debug("## Expected error=%o", e.reason);
		}
	})

	// Operator retire
	it("retire", async function () {
		const contract = await attachContract(contractName, contractAddress);
		let operatorList = await contract.getOperatorList();
		console.debug("## OperatorList(Before retire)=", operatorList);

		console.debug("## Operator(%s) retiring...", ownerAddress);
		const tx = await contract.retire();
		const receipt = await tx.wait(Confirmations);

		operatorList = await contract.getOperatorList();
		console.debug("## OperatorList(After retire)=", operatorList);

		const isOperator = operatorList.includes(signer1Address);
		expect(isOperator).to.equal(false);

		console.debug("## Operator(%s) retired, tx=%s", ownerAddress, receipt.transactionHash);
	})

	// Add operators
	it("addOperators", async function () {
		const contract = await attachContract(contractName, contractAddress);
		let operatorList = await contract.getOperatorList();
		console.debug("## OperatorList(Before addOperators)=", operatorList);

		const operators = [signer1Address, signer2Address];
		console.debug("## Adding operators(%s)...", operators);
		const tx = await contract.addOperators(operators);
		const receipt = await tx.wait(Confirmations);

		operatorList = await contract.getOperatorList();
		console.debug("## OperatorList(After addOperators)=", operatorList);

		const isOperator1 = operatorList.includes(signer1Address);
		expect(isOperator1).to.equal(true);
		const isOperator2 = operatorList.includes(signer2Address);
		expect(isOperator2).to.equal(true);

		console.debug("## Add operators(%o) completed, tx=", operators, receipt.transactionHash);
	})

	// Withdraw all
	it("withdrawAll", async function () {
		const contract = await connectContract(ownerAddress);
		const lastWithdrawBlocknumber1 = await contract.getLastWithdrawBlockNumber(signer3Address);
		console.debug("## Last withdraw blocknumber(Before)=%d", lastWithdrawBlocknumber1);

		const tx = await contract.withdrawAll(signer3Address);
		const receipt = await tx.wait(Confirmations);
		expect(receipt.status).to.equal(StatusSuccessful);

		const lastWithdrawBlocknumber2 = await contract.getLastWithdrawBlockNumber(signer3Address);
		console.debug("## Last withdraw blocknumber(After)=%d", lastWithdrawBlocknumber2);
		expect(receipt.blockNumber).to.equal(lastWithdrawBlocknumber2.toNumber());

		console.debug("## Withdraw all by contract owner(%s) completed, tx=%s, receipt=%o", ownerAddress, receipt.transactionHash, receipt);
	})
});
