import {customConfig} from '../../../config';
import {auditor, util} from '@jovijovi/pedrojs-common';

// GetOperator returns operator config
export function GetOperator(randomOperator = false): customConfig.Operator {
	auditor.Check(customConfig.GetFaucet().operatorList.length > 0, "no operator exist");

	if (!randomOperator) {
		return customConfig.GetFaucet().operatorList[0];
	}

	const index = util.random.RandIntBetween(0, customConfig.GetFaucet().operatorList.length);

	return customConfig.GetFaucet().operatorList[index];
}
