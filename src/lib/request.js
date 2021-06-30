import axios from 'axios';
import config from 'config';
import lang from '../v1/lang';
import { UNPROCESSABLE } from '../utils/constants';
import AppError from '../lib/api/app-error';

const baseUrl = config.get('app.baseUrl');
const auth = {
	'Authorization': 'Bearer ' + config.get('paystack.secret')
};
const defaultOptions = {
	baseURL: baseUrl,
	// headers: auth,
};

const instance = axios.create(defaultOptions);

/*
instance.interceptors.request.use(
	config => {
		config.headers['x-api-key'] = process.env.API_KEY;
		return config;
	},
	error => {
		// Do something with request error
		return Promise.reject(error);
	}
);
*/

instance.interceptors.response.use(
	response => {
		// Do something with response data
		console.log(response);
		return response.data;
	},
	error => {
		if (error.response) {
			// The request was made and the server responded with a task-status code
			// that falls out of the range of 2xx
			// throw error.response.data;
			const { data, status, statusText } = error.response;

			// return new AppError(data.message, status);
			return Promise.reject({ ...data, statusCode: status, statusText: statusText });
		} else if (error.request) {
			// The request was made but no response was received
			// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
			// http.ClientRequest in node.js
			// return Promise.reject(error.request);
			return Promise.reject({ statusCode: UNPROCESSABLE, statusText: lang.get('error').network });
		} else {
			// Something happened in setting up the request that triggered an Error
			console.log('Error', error.message);
		}
	}
);

/**
 * create request
 * @param {Object} config The request object
 * @return {Object} res The response object
 */
export default instance;
