// import AppValidation from '../_core/app.validation';
import _ from 'lodash';
import * as Joi from 'joi';
import config from '../../../../config/default';
import AppError from '../../../lib/api/app-error';

/**
 * The Merchant Validation class
 */
class MerchantValidation {
	/**
     * @param {Object} body The object to validate
     * @return {Object} Validator
     */
	async update(body = {}) {
		const schema = Joi.object({
			user: Joi.string()
				.optional(),
			name: Joi.string()
				.optional(),
			slug: Joi.string()
				.optional(),
			address: Joi.string()
				.optional(),
			bookingLimit: Joi.number()
				.optional(),
			profilePic: Joi.string()
				.optional(),
			brandColor: Joi.string()
				.optional(),
			regNo: Joi.string()
				.length(10)
				.pattern(/^[0-9]+$/, 'number')
				.optional(),
			regStatus: Joi.bool()
				.optional(),
			document: Joi.object({
				name: Joi.string()
					.required(),
				url: Joi.string()
					.required(),
				type: Joi.string()
					.required()
			}).optional(),
			operation: Joi.object({
				from: Joi.string()
					.required(),
				to: Joi.string()
					.required(),
				openHours: Joi.string()
					.required(),
				closeHours: Joi.string()
					.required()
			}).optional(),
			account: Joi.object({
				name: Joi.string()
					.required(),
				number: Joi.string()
					.length(10)
					.pattern(/^[0-9]+$/, 'number')
					.required(),
				bank: Joi.string()
					.required(),
				code: Joi.string()
					.required()
			}).optional(),
			country: Joi.string()
				.optional(),
			subscriptionPlan: Joi.string()
				.optional(),
			subscriptionId: Joi.string()
				.optional(),
			serviceLocations: Joi.array().items(Joi.object({
				location: Joi.string()
				.required(),
				postal: Joi.string()
				.pattern(/^[0-9]+$/, 'number')
				.required(),
			}))
				.optional(),
		}).options({ abortEarly: false });
		const validate = await schema.validate(body, config.options);
		return AppError.formatInputError(validate);
	}
}

export default MerchantValidation;
