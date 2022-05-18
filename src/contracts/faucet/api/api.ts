import {response as MyResponse} from '@jovijovi/pedrojs-network-http/server';
import {customConfig} from '../../../config';
import * as task from './task';

// Withdraw
export async function Withdraw(req, res) {
	if (!req.body ||
		!req.body.to
	) {
		return MyResponse.BadRequest(res);
	}

	try {
		const rsp = await task.PushFaucetRequest(req.body.to, req.body.amount);
		if (!rsp) {
			res.send({
				code: customConfig.GetFaucetRspCode().ERROR,
				msg: "address made a request within 1 hour",
			});
			return;
		}

		res.send({
			code: customConfig.GetFaucetRspCode().OK,
		});
	} catch (e) {
		return MyResponse.Error(res, e);
	}

	return;
}
