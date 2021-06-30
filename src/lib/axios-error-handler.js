import lang from '../v1/lang';
import { UNPROCESSABLE } from '../utils/constants';
const interceptor = {
    requestInterceptor(axios) {
        // Add a request interceptor
        // Add a request interceptor
        axios.interceptors.request.use(
            function(config) {
                // Do something before request is sent
                // Showing Vue loader before every request
                // loader;
                return config;
            },
            function(error) {
                // Do something with request error
                return Promise.reject(error);
            }
        );
    },

    responseInterceptor(axios) {
        // Add a response interceptor
        axios.interceptors.response.use(
            response => {
                // console.log('axios response', response);
                // Do something with response data
                return response || response.data || response.data.data;
            },
            error => {
                console.log(error.response);
                // check for errorHandle config
                /* if (
					error.config.hasOwnProperty('errorHandle') &&
                    error.config.errorHandle === false
				) {
					return Promise.reject(error);
				}*/
                // Do something with response error
                if (error.response) {
                    // Handling different error status using Switch caase
                    switch (error.response.status) {
                        case 400:
                            return Promise.reject({ statusCode: error.response.status, statusText: error.response.data });
                        case 401:
                            return Promise.reject({ statusCode: error.response.status, statusText: error.response.data.message });
                        case 403:
                            return Promise.reject({ statusCode: error.response.status, statusText: error.response.data.message });
                        case 404:
                            return Promise.reject({ statusCode: error.response.status, statusText: error.response.data.message });
                        case 500:
                            return Promise.reject({ statusCode: error.response.status, statusText: error.response.data.message });
                        case 503:
                            return Promise.reject({ statusCode: error.response.status, statusText: error.response.statusText || error.response.data.message });
                    }
                    if (error.response.data) {
                        let err = error.response.data;
                        return Promise.reject({ statusCode: err.error.statusCode, statusText: err.error.message });
                    }
                } else if (error.request) {
                    console.log('request error');
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    // return Promise.reject(error.request);
                    return Promise.reject({ statusCode: UNPROCESSABLE, statusText: lang.get('error').network });
                }
            }
        );
    }
};

export default interceptor;
