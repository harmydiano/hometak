import jwt from 'jsonwebtoken'; // used to create, sign, and verify tokens
import config from 'config';
import lang from '../lang';
import AppError from '../../lib/api/app-error';
import { UNAUTHORIZED } from '../../utils/constants';

export default (req, res, next) => {
	const token = req.body.token || req.query.token || req.headers['x-access-token'];
	// decode token
	if (token) {
		// verifies secret and checks exp
		jwt.verify(token, config.get('auth.encryption_key'), async (err, decoded) => {
			if (err) {
				let message = '';
				if (err.name) {
					switch (err.name) {
					case 'TokenExpiredError':
						message = 'You are not logged in!';
						break;
					default:
						message = 'Failed to authenticate token';
						break;
					}
				}
				const appError = new AppError(message, UNAUTHORIZED, null);
				return next(appError);
			} else {
				req.authId = decoded.authId;
				req.role = decoded.role;
				req.user = decoded.user;
				console.log(decoded);
				next();
			}
		});
	} else {
		const appError = new AppError(lang.get('auth').AUTH100, UNAUTHORIZED);
		return next(appError);
	}
};
