import {ethers} from 'hardhat';
import {Faucet, Faucet__factory} from '../typechain-types';

async function main(): Promise<void> {
	const factory: Faucet__factory = await ethers.getContractFactory("Faucet") as Faucet__factory;
	const contract: Faucet = await factory.deploy();
	await contract.deployed();
	console.log("Contract deployed to: ", contract.address);
}

main()
	.then(() => process.exit(0))
	.catch((error: Error) => {
		console.error(error);
		process.exit(1);
	});
