import * as core from 'express-serve-static-core';
import {API} from '../api';

export function APIs(router: core.Express) {
	defaultAPIs(router);
}

function defaultAPIs(router: core.Express) {
	router.post('/api/v1/faucet', API.Withdraw);
}
