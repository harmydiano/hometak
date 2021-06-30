import config from 'config';
import _ from 'lodash';
import resourceModels from '../rest/resource/index';
import { NOT_FOUND } from '../../utils/constants';
import lang from '../lang';
import AppError from '../../lib/api/app-error';

export default async (req, res, next) => {
	const url = decodeURI(req.url);
	// console.log('url', url);
	const path = new RegExp(`${config.get('api.resource')}`).exec(url);
	// console.log('path', path);
	if (path) {
		const parts = path[0].split('/');
		const resourceName = parts[2];
		console.log('resource', resourceName);
		const resource = await _.find(resourceModels, { resource_name: resourceName });
		if (!resource) {
			const appError = new AppError(lang.get('error').inputs, NOT_FOUND);
			return next(appError);
		}
		req.resource = resource;
	}
	return next();
};
