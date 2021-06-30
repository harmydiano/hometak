import config from 'config';
import _ from 'lodash';
import actionModels from '../rest/admin/action/index';
import { NOT_FOUND } from '../../utils/constants';
import lang from '../lang';
import AppError from '../../lib/api/app-error';

export default async (req, res, next) => {
	const url = decodeURI(req.url);
	const path = new RegExp(`${config.get('api.action')}`).exec(url);
	if (path) {
		console.log(url);
		const parts = url.split('/');
		const actionName = parts[2];
		console.log('action', parts);
		const action = await _.find(actionModels, { action_name: actionName });
		if (!action) {
			const appError = new AppError(lang.get('error').inputs, NOT_FOUND);
			return next(appError);
		}
		req.action = action;
		req.queryPath = parts[3];
	}
	return next();
};
