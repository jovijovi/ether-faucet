import {Wallet} from 'ethers';
import {Faucet, Faucet__factory} from '../../../../typechain-types';
import {network} from '@jovijovi/ether-network';
import {customConfig} from '../../../config';
import {Confirmations} from './params';

// Get contract class
export function GetContract(address: string, pk?: string): Faucet {
	if (!pk) {
		return Faucet__factory.connect(address, network.MyProvider.Get());
	}
	return Faucet__factory.connect(address, new Wallet(pk, network.MyProvider.Get()));
}

// GetConfirmations returns tx confirmations
export function GetConfirmations(): number {
	return customConfig.GetTxConfig().confirmations ? customConfig.GetTxConfig().confirmations : Confirmations;
}
