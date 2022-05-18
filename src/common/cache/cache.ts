import LRUCache from 'lru-cache';
import {cache} from '@jovijovi/pedrojs-common';

export namespace Cache {
	const cacheSet = cache.New();

	export function MemCache(name: string): LRUCache<any, any> {
		return cacheSet.New(name, {
			max: 10,
			ttl: 1000 * 60 * 60, // 1 hour
		});
	}
}
