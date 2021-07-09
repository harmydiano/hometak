import _ from 'lodash';
import BankProcessor from './bank.processor';
import { BAD_REQUEST, NOT_FOUND, OK } from '../../../utils/constants';
import { _extend } from 'util';
import BankValidation from "./bank.validation";
import lang from '../../lang';
import AppError from '../../../lib/api/app-error';

class BankController{
    /**
     * constructor
     * for the controller. Will be required to create
     * an instance of the controller¬
     */
	constructor() {
	}

    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async list(req, res, next) {
        try {
            const obj = req.body;
            const validator = await new BankValidation().list(obj);
            if (!validator.passed) {
                return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
            }
            const result = await BankProcessor.fetchBanks(obj);
            const response = await BankProcessor.getResponse({
                code: OK,
                value: result
            });
            return res.status(OK).json(response);
        } catch (err) {
            return next(err);
        }
    }

    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async account(req, res, next) {
        try {
            const obj = req.body;
            const validator = await new BankValidation().account(obj);
            if (!validator.passed) {
                return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
            }
            const result = await BankProcessor.resolveAccount(obj);
            const response = await BankProcessor.getResponse({
                code: OK,
                value: result
            });
            return res.status(OK).json(response);
        } catch (err) {
            return next(err);
        }
    }

}
export default BankController;
