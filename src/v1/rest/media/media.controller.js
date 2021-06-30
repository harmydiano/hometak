import _ from 'lodash';
import lang from '../../lang';
import AppController from '../_core/app.controller';
import { BAD_REQUEST, OK } from '../../../utils/constants';
import AppError from '../../../lib/api/app-error';

/**
 * The Base controller class where other controller inherits or
 * overrides pre defined and existing properties
 */
class MediaController extends AppController {
	/**
	 * @param {Model} name The name property is inherited
	 * from the parent
	 */
	constructor(name) {
		super(name);
		this.upload = this.upload.bind(this);
	}
	
	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {Function} next The callback to the next program handler
	 * @return {Object} res The response object
	 */
	async upload(req, res, next) {
		const user = req.authId;
		const account = req.accountId;
		if (!req.file || _.isEmpty(req.file)) {
			return next(new AppError(lang.get('file').no_file_uploaded, BAD_REQUEST));
		}
		const fileObj = req.file;
		const file = {
			url: fileObj.location,
			key: fileObj.key,
			mine_type: fileObj.metadata.mimetype,
		};
		try {
			let media = await (new this.model({ user, file, account })).save();
			req.response = {
				message: lang.get('file').uploaded,
				model: this.model,
				code: OK,
				value: media
			};
			return next();
		} catch (e) {
			return next(e);
		}
	}
}

export default MediaController;
