import config from 'config';
import _ from 'lodash';
import { NOT_FOUND } from '../../utils/constants';
import lang from '../lang';
import AppError from '../../lib/api/app-error';

export default async (req, res, next) => {
	let url = decodeURI(req.url);
	console.log('path', url);
	let arr = url.split('/');
	let id = arr.pop();
	if (id.match('^[a-zA-Z0-9]*$') && id.length == 24) {
		url = arr.join('/');
	}
	else if (!isNaN(id) && String(id).length == 13) {
		url = arr.join('/');
	}
	let object = Object.values(config.get('service'));
	if (!object.includes(url.substring(1))) {
		const appError = new AppError(lang.get('error').inputs, NOT_FOUND);
		return next(appError);
	}
	return next();
};
