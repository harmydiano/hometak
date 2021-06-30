import config from 'config';
import _ from 'lodash';
import dashboardModels from '../rest/dashboard/index';
import { NOT_FOUND } from '../../utils/constants';
import lang from '../lang';
import AppError from '../../lib/api/app-error';

export default async (req, res, next) => {
	const url = decodeURI(req.url);
	const path = new RegExp(`dashboard`).exec(url);
	if (path) {
		console.log(url);
		const parts = url.split('/');
		const dashboardName = parts[2];
		const dash = await _.find(dashboardModels, { dashboard_name: dashboardName });
		if (!dash) {
			const appError = new AppError(lang.get('error').inputs, NOT_FOUND);
			return next(appError);
		}
		req.dash = dash;
	}
	return next();
};
