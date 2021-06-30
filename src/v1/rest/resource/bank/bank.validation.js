import * as Joi from 'joi';
import AppValidation from '../../_core/app.validation';
import AppError from '../../../../lib/api/app-error';

/**
 * The StaffValidation class
 */
export default class BankValidation extends AppValidation {
	/**
	 * @param {Object} body The object to validate
	 * @return {Object} Validator
	 */
	async create(body) {
		const schema = Joi.object({
			name: Joi.string()
				.required(),
			code: Joi.string()
				.optional()
		}).options({ abortEarly: false });
		const validate = await schema.validate(body);
		return AppError.formatInputError(validate);
	}
}
