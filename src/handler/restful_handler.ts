import * as core from 'express-serve-static-core';
import {ITaskHandler} from '@jovijovi/pedrojs-network-http';
import {faucet} from '../contracts';

function defaultAPIs(router: core.Express) {
	router.use(notFound);
}

class privateImplHandlers implements ITaskHandler {
	RegisterHandlers(router: core.Express) {
		faucet.Handler.APIs(router);
		defaultAPIs(router);
	}
}

function notFound(req, res, next) {
	res.status(404).send({
		error: 'Not found',
	});
	next();
}

export const RestfulHandlers = new privateImplHandlers();