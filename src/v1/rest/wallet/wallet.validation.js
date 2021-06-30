import Validator from 'validatorjs';
import config from '../../../../config/default';
import * as Joi from 'joi';
import { isEmpty } from 'lodash';
import AppError from '../../../lib/api/app-error';

/**
 * The User Validation class
 */
const WalletValidation = {
	/**
	 * @param {Object} body The object to perform validation on
	 * @return {Validator} The validator object with the specified rules.
	 */
	async fund(body = {}) {
		const schema = Joi.object({
			amount: Joi.string()
				.length(11)
				.pattern(/^[0-9]+$/, 'number')
				.required(),
			type: Joi.string()
				.required()
		}).options({ abortEarly: false });
		const validate = await schema.validate(body, config.options);
		return AppError.formatInputError(validate);
	}
};
export default WalletValidation;
