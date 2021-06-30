import lang from '../lang';
import AppError from '../../lib/api/app-error';
import { FORBIDDEN } from '../../utils/constants';
/**
 * 
 * @param  {...any} permittedRoles 
 * @return {Object} next The response object
 */
export default function permit(...permittedRoles) {
	// return a middleware
	return (req, res, next) => {
		const { role } = req;
		console.log(req.role, permittedRoles);
  
		if (role && permittedRoles.includes(role)) {
			next(); // role is allowed, so continue on the next middleware
		} else {
			const appError = new AppError(lang.get('auth').forbidden, FORBIDDEN);
			return next(appError);
		}
	};
}
