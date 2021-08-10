// import AppValidation from '../_core/app.validation';
import _ from 'lodash';
import * as Joi from 'joi';
import config from '../../../../config/default';
import AppError from '../../../lib/api/app-error';

/**
 * The Cleaners Validation class
 */
class CleanersValidation {
	/**
     * @param {Object} body The object to validate
     * @return {Object} Validator
     */
	async register(body ={}) {
        console.log(body);
        const schema = Joi.object({
            email: Joi.string().email().required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            gender: Joi.string().required(),
            state: Joi.string().required(),
            address: Joi.string().required(),
            lga: Joi.string().required(),
            dateOfBirth: Joi.date().required()
        }).options({ abortEarly: false });
        const validate = await schema.validate(body, config.options);
        return AppError.formatInputError(validate);
	}

	async update(body ={}) {
        console.log(body);
        const schema = Joi.object({
			id: Joi.string().optional(),
			user: Joi.string().optional(),
			isOnline: Joi.bool().optional(),
			isDisabled: Joi.bool().optional(),
            firstName: Joi.string().optional(),
			lastName: Joi.string().optional(),
			profilePic: Joi.string().optional(),
			phone: Joi.string().optional(),
            state: Joi.string().optional(),
			lga: Joi.string().optional(),
			dateOfBirth: Joi.date().optional(),
			location: Joi.object({
				type: Joi.string().optional(),
				coordinates: Joi.array().items(Joi.number())
				.optional(),
			}).optional(),
        }).options({ abortEarly: false });
        const validate = await schema.validate(body, config.options);
        return AppError.formatInputError(validate);
	}

	async location(body ={}) {
        console.log('location body', body);
        const schema = Joi.object({
            long: Joi.number().required(),
            latt: Joi.number().required()
        }).options({ abortEarly: false });
        const validate = await schema.validate(body, config.options);
        return AppError.formatInputError(validate);
	}
	
    async find(body ={}) {
        const schema = Joi.object({
            ambulanceType: Joi.string().required(),
            long: Joi.number().required(),
            latt: Joi.number().required()
        }).options({ abortEarly: false });
        const validate = await schema.validate(body, config.options);
        return AppError.formatInputError(validate);
	}
}

export default CleanersValidation;
