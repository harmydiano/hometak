import AppError from '../lib/api/app-error';
import { UNAUTHORIZED } from '../utils/constants';

export default (req, res, next) => {
    // check header or url parameters or post parameters for token
    let apiKey = req.query.api_key || req.headers['x-api-key'];
    /* if (!apiKey) {
    	return next(new AppError('Api key absent', UNAUTHORIZED));
    }
    // decode token
    if (apiKey !== process.env.API_KEY && !process.env.API_KEY.includes(apiKey)) {
    	return next(new AppError('Invalid Api Key', UNAUTHORIZED));
    }*/
    // if there is no token, return an error
    return next();
};
