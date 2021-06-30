import _ from 'lodash';
import Q from 'q';
import { banks, OK } from '../../../utils/constants';
import APP_RESOURCES from './index';
import lang from '../../lang';
import AppController from '../_core/app.controller';
import AppResponse from '../../../lib/api/app-response';

/**
 * The App controller class where other controller inherits or
 * overrides pre defined and existing properties
 */
class ResourceController extends AppController {
	/**
	 * @param {Model} model The default model object
	 * for the controller. Will be required to create
	 * an instance of the controller
	 */
	constructor(model = null) {
		super(model);
		this.lang = lang.get('resource');
		// this.autoComplete = this.autoComplete.bind(this);
		this.list = this.list.bind(this);
		this.all = this.all.bind(this);
	}
	
	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 * @param {String} id The id from the url parameter
	 */
	id(req, res, next, id) {
		this.model = req.resource.model;
		super.id(req, res, next, id);
	}
	
	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 */
	async create(req, res, next) {
		this.model = req.resource.model;
		super.create(req, res, next);
	}
	
	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 */
	async find(req, res, next) {
		this.model = req.resource.model;
		super.find(req, res, next);
	}
	
	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 */
	async status(req, res, next) {
		this.model = req.resource.model;
		super.status(req, res, next);
	}
	
	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {Function} next The callback to the next program handler
	 * @return {Object} res The response object
	 */
	async list(req, res, next) {
		const resources = _.map(APP_RESOURCES, (resource) => {
			return {
				name: resource.resource_name.replace(/-/g, ' '),
				url: resource.resource_name
			};
		});
		req.response = {
			code: OK,
			value: resources
		};
		return next();
	}
	
	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {Function} next The callback to the next program handler
	 * @return {Object} res The response object
	 */
	async all(req, res, next) {
		const resources = _.map(APP_RESOURCES, (resource) => {
			return Q.all([resource.model.find(), resource.resource_name.replace(/-/g, '_')]);
		});
		try {
			const result = await Q.all(resources);
			const objects = result.map((object) => {
				const obj = {};
				obj[object[1]] = object[0];
				return obj;
			});
			const meta = new AppResponse.getSuccessMeta();
			const response = AppResponse.format(meta, objects);
			return res.status(OK).json(response);
		} catch (err) {
			return next(err);
		}
	}
}

export default ResourceController;
