// import AppValidation from '../_core/app.validation';
import _ from 'lodash';
import * as Joi from 'joi';
import config from '../../../../config/default';
import AppError from '../../../lib/api/app-error';

/**
 * The Bank Validation class
 */
class BankValidation {
	/**
     * @param {Object} body The object to validate
     * @return {Object} Validator
     */
	async list(body ={}) {
        console.log(body);
        const schema = Joi.object({
            country: Joi.string().required(),
        }).options({ abortEarly: false });
        const validate = await schema.validate(body, config.options);
        return AppError.formatInputError(validate);
	}

	async account(body ={}) {
        console.log('location body', body);
        const schema = Joi.object({
            account_number: Joi.string().required(),
            account_bank: Joi.string().required()
        }).options({ abortEarly: false });
        const validate = await schema.validate(body, config.options);
        return AppError.formatInputError(validate);
	}
}

export default BankValidation;
