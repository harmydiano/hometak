import AppController from '../_core/app.controller';
import _ from 'lodash';
import WalletProcessor from './wallet.processor';
import { NOT_FOUND, OK } from '../../../utils/constants';
import lang from '../../lang';
import AppError from '../../../lib/api/app-error';

/**
 *  TaskController
 */
class WalletController {
	/**
     * @param {Model} model The default model object
     * for the controller. Will be required to create
     * an instance of the controller¬
     */
	constructor(model) {
		if (model) {
			this.model = model;
			this.lang = lang.get(model.collection.collectionName);
		}
		this.id = this.id.bind(this);
	}
    
	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {Function} next The callback to the next program handler
	 * @return {Object} res The response object
	 */
	async id(req, res, next) {
		let request = this.model.findOne({ _id: req.authId });
		try {
			let object = await request;
			if (object) {
				const response = await WalletProcessor.getResponse({
					model: this.model,
					code: OK,
					value: _.pick(object, ['_id', 'amount', 'availableBalance']),
				});
				return res.status(OK).json(response);
			}
			const appError = new AppError(this.lang.not_found, NOT_FOUND);
			return next(appError);
		} catch (err) {
			return next(err);
		}
	}
}

export default WalletController;
