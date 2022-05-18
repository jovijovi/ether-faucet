import {utils} from 'ethers';
import {log} from '@jovijovi/pedrojs-common';
import {network} from '@jovijovi/ether-network';
import {keystore} from '@jovijovi/ether-keystore';
import {TransactionReceipt} from '@ethersproject/abstract-provider';
import {GetConfirmations, GetContract} from './common';
import {KeystoreTypeOperator, StatusSuccessful} from './params';
import {customConfig} from '../../../config';
import {GetOperator} from './operator';

// Withdraw
export async function Withdraw(address: string, amount: string): Promise<TransactionReceipt> {
	const provider = network.MyProvider.Get();
	const operator = GetOperator(customConfig.GetFaucet().randomFaucet);
	const pk = await keystore.InspectKeystorePK(operator.address, KeystoreTypeOperator, operator.keyStoreSK);
	const contract = GetContract(customConfig.GetFaucet().faucetContractAddress, pk);

	// Send tx
	const tx = await contract.withdraw(address, utils.parseEther(amount));
	log.RequestId().info("Withdrawing to recipient(%s)... FaucetAmount=%s, TxHash=%s, GasLimit=%d, GasPrice=%d",
		address, amount, tx.hash, tx.gasLimit, tx.gasPrice);

	// Wait tx
	const receipt = await provider.waitForTransaction(tx.hash, GetConfirmations());

	// Check tx status
	if (receipt.status != StatusSuccessful) {
		log.RequestId().error("Withdraw failed, error=%o", receipt);
		return;
	}

	log.RequestId().info("Withdraw completed. TxHash=%s, BlockNumber=%s, Operator=%s, FaucetContract=%s, Recipient=%s, GasUsed=%d",
		receipt.transactionHash, receipt.blockNumber, receipt.from, receipt.to, address, receipt.gasUsed.toString());

	return receipt;
}
