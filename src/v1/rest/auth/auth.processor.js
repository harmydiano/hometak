import jwt from 'jsonwebtoken';
import lang from '../../lang';
import config from 'config';
import crypto from 'crypto';
import _ from 'lodash';
import UserProcessor from '../user/user.processor';
import MerchantProcessor from '../merchant/merchant.processor';
import Auth from './auth.model';
import { addHourToDate, sendEmail } from '../../../utils/helpers';
import { CONFLICT, FORBIDDEN, NOT_FOUND, UNAUTHORIZED, MERCHANT } from '../../../utils/constants';
import AppResponse from '../../../lib/api/app-response';
import AppError from '../../../lib/api/app-error';

const AuthProcessor = {
	/**
     * @param {Object} obj The object properties
     * @return {Promise<Object>}
     */
	async processNewObject(obj) {
		obj.verifyCodeExpiration = addHourToDate(1);
		const code = 1234;
		// const code = generateOTCode(4);
		obj = await _.extend(obj, { verificationCode: code });
		return obj;
	},
	/**
     * @param {Object} obj The object properties
     * @return {Promise<Object>}
     */
	async processProfileUpdate(obj) {
		return obj.role != MERCHANT
			? await UserProcessor.getUser(obj)
			: await MerchantProcessor.getUser(obj)
	},
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
     * @param {Object} auth The object properties
     * @return {Promise<String>}
     */
	async signToken({ auth, user }) {
		const userInfo = _.pick(user, ['firstName', 'lastName']);
		const obj = {
			user: userInfo,
			authId: auth._id,
			role: config.get('memberRoles')[1],
			...(_.pick(auth, ['accountVerified']))
		};
		const sign = jwt.sign(obj, config.get('auth.encryption_key'), { expiresIn: config.get('auth.expiresIn') });
		return sign;
	},
	/**
     * @param {Object} user The main property
     * @param {Object} object The object properties
     * @return {Object} returns the api error if main cannot be verified
     */
	canLogin(user, object) {
		if (!user) {
			return new AppError(lang.get('auth').authentication_failed, UNAUTHORIZED);
		}
		let authenticated = object.password && user.password && user.comparePassword(object.password);
		if (!authenticated) {
			return new AppError(lang.get('auth').authentication_failed, UNAUTHORIZED);
		}
		return true;
	},
	/**
     * @param {Object} auth The main property
     * @param {Object} object The object properties
     * @return {Object} returns the api error if main cannot be verified
     */
	async canVerify(auth, object) {
		if (auth) {
			console.log(auth);
			return new AppError(lang.get('auth').user_exist, CONFLICT);
		}
		return true;
	},
	/**
     * @param {Object} auth The main property
     * @param {Object} object The object properties
     * @return {Object} returns the main error if main cannot be verified
     */
	async cannotVerifyEmail(auth, object) {
		if (!auth) {
			return new AppError(lang.get('auth').account_does_not_exist, NOT_FOUND);
		}
		if (!(auth.verifyCodeExpiration && auth.verificationCode)) {
			return new AppError(lang.get('auth').verify_unauthorized, FORBIDDEN);
		}
		const userHash = crypto.createHash('md5').update(auth.verificationCode).digest('hex');
		if ((object.hash && (userHash !== object.hash)) ||
            (object.verificationCode && (auth.verificationCode !== object.verificationCode))) {
			return new AppError(lang.get('auth').verify_unauthorized, UNAUTHORIZED);
		}
		if (new Date() > auth.verifyCodeExpiration) {
			return new AppError(lang.get('auth').password_reset_code_expired, FORBIDDEN);
		}
		return null;
	},
	/**
     * @param {Object} auth The main property
     * @param {Object} object The object properties
     * @return {Object} returns the main error if main cannot be verified
     */
	async cannotResetPassword(auth, object) {
		if (!auth) {
			return new AppError(lang.get('auth').account_does_not_exist, NOT_FOUND);
		}
		if (!(auth.resetCodeExpiration && auth.passwordResetCode)) {
			return new AppError(lang.get('auth').password_reset_unauthorized, FORBIDDEN);
		}
		const userHash = crypto.createHash('md5').update(auth.passwordResetCode).digest('hex');
		if ((object.hash && (userHash !== object.hash)) ||
            (object.passwordResetCode && (auth.passwordResetCode !== object.passwordResetCode))) {
			return new AppError(lang.get('auth').password_reset_unauthorized, UNAUTHORIZED);
		}
		if (new Date() > auth.resetCodeExpiration) {
			return new AppError(lang.get('auth').password_reset_code_expired, FORBIDDEN);
		}
		return null;
	},
	/**
     * @param {Object} auth The main property
     * @param {Object} object The object properties
     * @return {Object} returns true if password has been updated
     */
	async resetUserPassword(auth, object) {
		auth.password = object.password;
		await auth.save();
		return true;
	},
	/**
     * @param {Object} auth The main property
     * @param {Object} object The object properties
     * @return {Object} returns true if password has been updated
     */
	async updateEmailVerification(auth, object) {
		auth.verificationCode = null;
		auth.accountVerified = true;
		auth.active = true;
		await auth.save();
		return true;
	},
	/**
     * @param {Object} auth The main property
     * @param {Object} userId The object properties
     * @return {Object} returns true if password has been updated
     */
	async fetchEmail(auth, userId) {
		console.log(auth, userId);
		const data = await auth.findById(userId);
		console.log(data);
		return data.email;
	},
	/**
     * @param {Object} auth The main property
     * @param {Object} object The object properties
     * @return {Object} returns true if password has been updated
     */
	async create(obj) {
		const { email, session } = obj;
        const objectToUpdate = _.pick(obj, ['email']);
        console.log(objectToUpdate);
        let found = await Auth.findOne({ email }).session(session);
        if (!found) {
            found = await Auth.findOneAndUpdate({ email }, { $set: objectToUpdate }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
                session
            });
        }
        return found;
	},
	async isEmailExist(email) {
        let found = await Auth.findOne({email});
        return found;
    },
    async isUserExist(id) {
        let found = await Auth.findById(id);
        return found;
    }
};

export default AuthProcessor;
