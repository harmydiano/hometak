// import AppValidation from '../_core/app.validation';
import _ from 'lodash';
import * as Joi from 'joi';
import config from '../../../../config/default';
import AppError from '../../../lib/api/app-error';

/**
 * The Plan Validation class
 */
class BookingValidation {
	/**
     * @param {Object} body The object to validate
     * @return {Object} Validator
     */
	async create(body = {}) {
		const schema = Joi.object({
			user: Joi.string()
				.optional(),
			name: Joi.string()
				.required(),
			merchantId: Joi.string()
				.required(),
			email: Joi.string()
				.email()
				.required(),
			location: Joi.string()
				.required(),
			plan: Joi.string()
				.required(),
			planName: Joi.string()
				.required(),
			postal: Joi.string()
				.required(),
			date: Joi.string()
				.required(),
			address: Joi.string()
				.optional(),
			noOfRoom: Joi.number()
				.optional(),
			time: Joi.string()
				.optional(),
			additionalNotes: Joi.string()
				.optional(),
			addOns: Joi.array().items(Joi.object({
				name: Joi.string()
				.required(),
				quantity: Joi.number()
				.required()
			}))
				.optional(),
		}).options({ abortEarly: false });
		const validate = await schema.validate(body, config.options);
		return AppError.formatInputError(validate);
	}
	/**
     * @param {Object} body The object to validate
     * @return {Object} Validator
     */
	async update(body = {}) {
		const schema = Joi.object({
			user: Joi.string()
				.optional(),
			location: Joi.string()
				.optional(),
			status: Joi.string()
				.optional(),
			postal: Joi.string()
				.optional(),
			date: Joi.string()
				.optional(),
			address: Joi.string()
				.optional(),
			noOfRoom: Joi.string()
				.optional(),
			date: Joi.date()
				.optional(),
			time: Joi.string()
				.optional(),
			additionalNotes: Joi.string()
				.optional(),
			addOns: Joi.array().items(Joi.object({
				name: Joi.string()
				.required(),
				quantity: Joi.string()
				.pattern(/^[0-9]+$/, 'number')
				.required(),
				price: Joi.string()
				.pattern(/^[0-9]+$/, 'number')
				.required(),
			}))
				.optional(),
		}).options({ abortEarly: false });
		const validate = await schema.validate(body, config.options);
		return AppError.formatInputError(validate);
	}
}

export default new BookingValidation();
