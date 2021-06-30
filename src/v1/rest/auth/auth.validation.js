import Validator from 'validatorjs';
import config from '../../../../config/default';
import * as Joi from 'joi';
import { isEmpty } from 'lodash';
import AppError from '../../../lib/api/app-error';

/**
 * The User Validation class
 */
const AuthValidation = {
	/**
     * @param {Object} body The object to perform validation on
     * @return {Validator} The validator object with the specified rules.
     */
	async authenticate(body = {}) {
		const schema = Joi.object({
			mobile: Joi.string()
				.length(11)
				.pattern(/^[0-9]+$/, 'number')
				.required()
		}).options({ abortEarly: false });
		const validate = await schema.validate(body, config.options);
		return AppError.formatInputError(validate);
	},
	/**
     * @param {Object} body The object to validate
     * @return {Object} Validator
     */
	async signUp(body = {}) {
		const schema = Joi.object({
			email: Joi.string()
				.email()
				.required(),
			password: Joi.string()
				.alphanum()
				.min(6)
				.required(),
			country: Joi.string()
				.required(),
			role: Joi.string()
				.required(),
		}).options({ abortEarly: false });
		const validate = await schema.validate(body, config.options);
		return AppError.formatInputError(validate);
	},
	/**
     * @param {Object} body The object to validate
     * @return {Object} Validator
     */
	async signIn(body = {}) {
		const schema = Joi.object({
			email: Joi.string()
				.email()
				.required(),
			password: Joi.string()
				.alphanum()
				.required()
		}).options({ abortEarly: false });
		const validate = await schema.validate(body, config.options);
		return AppError.formatInputError(validate);
	},
	/**
     * @param {Object} body The object to validate
     * @return {Object} Validator
     */
	async resendEmail(body = {}) {
		const schema = Joi.object({
			email: Joi.string()
				.email()
				.required()
		}).options({ abortEarly: false });
		const validate = await schema.validate(body, config.options);
		return AppError.formatInputError(validate);
	},
	/**
     * @param {Object} body The object to validate
     * @return {Object} Validator
     */
	async verifyEmailCode(body = {}) {
		console.log(body);
		const schema = Joi.object({
			email: Joi.string()
				.email()
				.required(),
			verificationCode: Joi.number()
				.required(),
			hash: Joi.string()
				.optional()
		}).options({ abortEarly: false });
		const validate = await schema.validate(body, config.options);
		return AppError.formatInputError(validate);
	},
	/**
     * @param {Object} body The object to validate
     * @return {Object} Validator
     */
	async sendResetCode(body = {}) {
		const schema = Joi.object({
			email: Joi.string()
				.email()
				.required()
		}).options({ abortEarly: false });
		const validate = await schema.validate(body, config.options);
		return AppError.formatInputError(validate);
	},

	/**
     * @param {Object} body The object to validate
     * @return {Object} Validator
     */
	async resetPassword(body = {}) {
		const schema = Joi.object({
			email: Joi.string()
				.email(11)
				.required(),
			password: Joi.string()
				.alphanum()
				.min(6)
				.required(),
			password_confirm: Joi.string()
				.valid(Joi.ref('password'))
				.required()
				.messages({ 'any.only': 'Password must match' }),
			passwordResetCode: Joi.number()
				.required(),
			hash: Joi.string()
				.required()
		}).options({ abortEarly: false });
		const validate = await schema.validate(body, config.options);
		return AppError.formatInputError(validate);
	}
};

export default AuthValidation;
