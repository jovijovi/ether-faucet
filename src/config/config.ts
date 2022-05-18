import {config} from '@jovijovi/pedrojs-common';

export namespace customConfig {
	class TxConfig {
		confirmations: number
	}

	export class Operator {
		address: string
		keyStoreSK?: string
	}

	class Faucet {
		faucetContractAddress: string
		faucetAmount: string
		randomFaucet?: boolean
		apiResponseCode: any
		operatorList: Operator[]
	}

	export class CustomConfig {
		tx: TxConfig
		faucet?: Faucet
	}

	let customConfig: CustomConfig;

	export function LoadCustomConfig() {
		customConfig = config.GetYmlConfig().custom;
	}

	export function Get() {
		return customConfig;
	}

	// GetTxConfig returns tx config
	export function GetTxConfig(): TxConfig {
		return customConfig.tx;
	}

	// GetFaucet returns faucet config
	export function GetFaucet(): Faucet {
		if (customConfig.faucet) {
			return customConfig.faucet;
		}

		throw new Error(`GetFaucet Failed, invalid config`);
	}

	// GetFaucetRspCode returns faucet response code
	export function GetFaucetRspCode(): any {
		if (customConfig.faucet) {
			return customConfig.faucet.apiResponseCode;
		}

		throw new Error(`GetFaucetResponseCode Failed, invalid config`);
	}
}
