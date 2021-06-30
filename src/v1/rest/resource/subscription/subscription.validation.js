import * as Joi from 'joi';
import AppValidation from '../../_core/app.validation';
import AppError from '../../../../lib/api/app-error';
/**
 * The SubscriptionValidation class
 */
export default class SubscriptionValidation extends AppValidation {
	/**
	 * @param {Object} body The object to validate
	 * @return {Object} Validator
	 */
	async create(body) {
		const schema = Joi.object({
			name: Joi.string()
				.required(),
			price: Joi.number()
				.required()
		}).options({ abortEarly: false });
		const validate = await schema.validate(body);
		return AppError.formatInputError(validate);
	}
	/**
	 * @param {Object} body The object to validate
	 * @return {Object} Validator
	 */
	async update(body) {
		const schema = Joi.object({
			
			price: Joi.number()
				.required()
		}).options({ abortEarly: false });
		const validate = await schema.validate(body);
		return AppError.formatInputError(validate);
	}
}
