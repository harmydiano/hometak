import jwt from 'jsonwebtoken';
import Auth from '../auth/auth.model';
import config from 'config';
import _ from 'lodash';
import { addHourToDate, sendEmail } from '../../../utils/helpers';
import { OK, FORBIDDEN, NOT_FOUND, UNAUTHORIZED } from '../../../utils/constants';
import AppResponse from '../../../lib/api/app-response';
import AppError from '../../../lib/api/app-error';

const AuthProcessor = {
	/**
     * @param {Object} options required for response
     * @return {Promise<Object>}
     */
	async getResponse({ model, value, code, message, count, token, email }) {
		try {
			const meta = AppResponse.getSuccessMeta();
			if (token) {
				meta.token = token;
			}
			_.extend(meta, { status_code: code });
			if (message) {
				meta.message = message;
			}
			if (model.hiddenFields && model.hiddenFields.length > 0) {
				value = _.omit(value.toJSON(), ...model.hiddenFields);
			}
			if (email) {
				sendEmail(email);
			}
			return AppResponse.format(meta, value);
		} catch (e) {
			throw e;
		}
	},
	/**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {Object} res The response object
     */
	async processResponse(req, res) {
		const token = await AuthProcessor.signToken({ auth: req.user });
		const response = await AuthProcessor.getResponse({
			token,
			model: Auth,
			code: OK,
			value: _.pick(req.user, ['_id', 'active', 'accountVerified']),
		});
		return res.status(OK).json(response);
	},
	/**
     * @param {Object} auth The object properties
     * @return {Promise<String>}
     */
	async signToken({ auth, user }) {
		console.log(auth._id);
		const obj = {
			authId: auth._id,
			role: config.get('memberRoles')[1],
			...(_.pick(auth, ['accountVerified']))
		};
		const sign = jwt.sign(obj, config.get('auth.encryption_key'), { expiresIn: config.get('auth.expiresIn') });
		return sign;
	},
	/**
     * @param {String} obj The payload object
     * @return {Object}
     */
	async processFbLogin(obj) {
		const { auth, profile } = obj;
		console.log(profile);
		const result = await auth.findOneAndUpdate({
			facebookId: profile.id
		}, {
			facebookId: profile.id,
			// email: profile.emails[0].value
		}, { upsert: true, new: true });
		return result;
	},
	/**
     * @param {String} obj The payload object
     * @return {Object}
     */
	async processGoogleLogin(obj) {
		const { auth, profile } = obj;
		const verifiedEmail = _.head(profile.emails).value;
		console.log('email', verifiedEmail);
		const result = await auth.findOneAndUpdate({
			googleId: profile.id
		}, {
			googleId: profile.id,
			email: verifiedEmail
		}, { upsert: true, new: true });
		return result;
	}
};

export default AuthProcessor;
