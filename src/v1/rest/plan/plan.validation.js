// import AppValidation from '../_core/app.validation';
import _ from 'lodash';
import * as Joi from 'joi';
import config from '../../../../config/default';
import AppError from '../../../lib/api/app-error';

/**
 * The Plan Validation class
 */
class PlanValidation {
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
			type: Joi.string()
				.required(),
			frequency: Joi.string()
				.required(),
			description: Joi.string()
				.optional(),
			pricing: Joi.object({
				option: Joi.string()
					.required(),
				amount: Joi.number()
					.required(),
			}).optional(),
			addOns: Joi.array().items(Joi.object({
				name: Joi.string()
				.required(),
				price: Joi.number()
				.required(),
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
			name: Joi.string()
				.optional(),
			active: Joi.bool()
				.optional(),
			type: Joi.string()
				.optional(),
			frequency: Joi.string()
				.optional(),
			description: Joi.string()
				.optional(),
			pricing: Joi.object({
				option: Joi.string()
					.required(),
				amount: Joi.number()
					.required(),
			}).optional(),
			addOns: Joi.array().items(Joi.object({
				name: Joi.string()
				.required(),
				price: Joi.number()
				.required(),
			}))
				.optional(),
		}).options({ abortEarly: false });
		const validate = await schema.validate(body, config.options);
		return AppError.formatInputError(validate);
	}
}

export default PlanValidation;
