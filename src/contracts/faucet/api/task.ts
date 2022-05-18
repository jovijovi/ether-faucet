import {utils} from 'ethers';
import {customConfig} from '../../../config';
import {log} from '@jovijovi/pedrojs-common';
import type {queueAsPromised} from 'fastq';
import * as fastq from 'fastq';
import {Cache} from '../../../common/cache';
import {ABI} from '../abi';

type FaucetTask = {
	to: string
	faucetAmount: string
}

const CacheNameFaucet = 'faucetHistory';
const CacheNameQueue = 'queueHistory';

// Faucet queue
const queue: queueAsPromised<FaucetTask> = fastq.promise(asyncWorker, 1);

// Run async faucet worker
// The same address is only allowed to request every 1 hour.
// Cache ttl=1 hour
async function asyncWorker(arg: FaucetTask): Promise<void> {
	log.RequestId().trace("Processing the request", arg);

	if (Cache.MemCache(CacheNameFaucet).has(arg.to)) {
		// The faucet requests of the address are too frequent, return directly
		return;
	}

	const receipt = await ABI.Withdraw(arg.to, getFaucetAmount(arg.faucetAmount));

	Cache.MemCache(CacheNameFaucet).set(arg.to, true);

	log.RequestId().info("TASK(Withdraw) completed. TxHash=%s", receipt.transactionHash);

	return;
}

// PushFaucetRequest push faucet request to job queue
export async function PushFaucetRequest(to: string, faucetAmount: string): Promise<boolean> {
	if (!to) {
		throw new Error('recipient address is empty');
	} else if (!utils.isAddress(to)) {
		throw new Error('invalid address');
	} else if (faucetAmount && !Number(faucetAmount)) {
		// Check amount
		throw new Error('invalid amount');
	} else if (to.toLowerCase() === customConfig.GetFaucet().faucetContractAddress.toLowerCase()) {
		log.RequestId().warn("Funding to the faucet address(%s) is not allowed, the request has been ignored",
			customConfig.GetFaucet().faucetContractAddress);
		return true;
	}

	if (queue.length() >= 1000) {
		throw new Error('too many faucet requests, wait for a moment...')
	}

	if (Cache.MemCache(CacheNameQueue).has(to)) {
		// The faucet requests of the address are too frequent, return directly
		return false;
	}

	// add faucet request to queue
	queue.push({
		to: to,
		faucetAmount: faucetAmount,
	}).catch((err) => log.RequestId().error(err));

	Cache.MemCache(CacheNameQueue).set(to, true);

	log.RequestId().debug("Withdraw request has been queued(count=%d), to=%s, faucetAmount=%s", queue.length(), to, faucetAmount);

	return true;
}

function getFaucetAmount(faucetAmount: string): string {
	return !faucetAmount ? customConfig.GetFaucet().faucetAmount : faucetAmount;
}
