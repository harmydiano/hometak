// import AppValidation from '../_core/app.validation';
import deepmerge from 'deepmerge';
import _ from 'lodash';
import * as Joi from 'joi';
import config from '../../../../config/default';
import AppError from '../../../lib/api/app-error';

/**
 * The User Validation class
 */
class UserValidation {
	/**
     * @param {Object} body The object to validate
     * @return {Object} Validator
     */
	async update(body = {}) {
		const schema = Joi.object({
			user: Joi.string()
				.optional(),
			firstName: Joi.string()
				.optional(),
			lastName: Joi.string()
				.optional(),
			gender: Joi.string()
				.optional(),
			country: Joi.string()
				.optional(),
			mobile: Joi.string()
				.optional(),
			fplId: Joi.string()
				.length(9)
				.pattern(/^[0-9]+$/, 'number')
				.optional(),
			fplPass: Joi.string()
				.optional()
		}).options({ abortEarly: false });
		const validate = await schema.validate(body, config.options);
		return AppError.formatInputError(validate);
	}
}

export default UserValidation;
