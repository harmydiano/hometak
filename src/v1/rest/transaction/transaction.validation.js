import Validator from 'validatorjs';
import config from '../../../../config/default';
import * as Joi from 'joi';
import { isEmpty } from 'lodash';
import AppError from '../../../lib/api/app-error';

/**
 * The User Validation class
 */
const TransactionValidation = {
    /**
     * @param {Object} body The object to perform validation on
     * @return {Validator} The validator object with the specified rules.
     */
    async create(body = {}) {
        const schema = Joi.object({
            amount: Joi.number()
                .required(),
            bookingId: Joi.string()
                .optional(),
            subscriptionId: Joi.string()
                .optional(),
            transType: Joi.string()
                .required(),
            transMethod: Joi.string()
                .required()

        }).options({ abortEarly: false });
        const validate = await schema.validate(body, config.options);
        return AppError.formatInputError(validate);
    },
     /**
     * @param {Object} body The object to perform validation on
     * @return {Validator} The validator object with the specified rules.
     */
    async transfer(body = {}) {
        const schema = Joi.object({
            amount: Joi.number()
                .required(),
            currency: Joi.string()
                .optional(),
            destination: Joi.string()
                .optional(),
            description: Joi.string()
                .required(),

        }).options({ abortEarly: false });
        const validate = await schema.validate(body, config.options);
        return AppError.formatInputError(validate);
    },
     /**
     * @param {Object} body The object to perform validation on
     * @return {Validator} The validator object with the specified rules.
     */
    async charge(body = {}) {
        const schema = Joi.object({
            cardNumber: Joi.string()
                .required(),
            cardCVC: Joi.string()
                .required(),
            cardExpMonth: Joi.string()
                .required(),
            cardExpYear: Joi.string()
                .required(),
            currency: Joi.string()
                .required(),
            country: Joi.string()
                .required(),
            amount: Joi.number()
                .required(),
            transId: Joi.number()
                .required(),
            email: Joi.string()
                .required(),
            phone: Joi.string()
                .required(),
            name: Joi.string()
                .required()

        }).options({ abortEarly: false });
        const validate = await schema.validate(body, config.options);
        return AppError.formatInputError(validate);
    },
    /**
     * @param {Object} body The object to perform validation on
     * @return {Validator} The validator object with the specified rules.
     */
    async store(body = {}) {
        const schema = Joi.object({
            amount: Joi.number()
                .required(),
            transId: Joi.number()
                .required(),

        }).options({ abortEarly: false });
        const validate = await schema.validate(body, config.options);
        return AppError.formatInputError(validate);
    },
    /**
     * @param {Object} body The object to perform validation on
     * @return {Validator} The validator object with the specified rules.
     */
    async refund(body = {}) {
        const schema = Joi.object({
            amount: Joi.number()
                .required(),
            authorizationCode: Joi.number()
                .required(),

        }).options({ abortEarly: false });
        const validate = await schema.validate(body, config.options);
        return AppError.formatInputError(validate);
    }
};
export default TransactionValidation;
