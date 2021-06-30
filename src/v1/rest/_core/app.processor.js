import AppResponse from '../../../lib/api/app-response';
import _ from 'lodash';
import { sendEmail } from '../../../utils/helpers';

export const CREATE = 'create';
export const UPDATE = 'update';
export const DELETE = 'delete';

/**
 * The main processor class
 */
export default class AppProcessor {
	/**
     * @param {Model} model The default model object
     * for the controller. Will be required to create
     * an instance of the controller
     */
	constructor(model) {
		this.model = model;
	}

	/**
     * @param {Object} obj required for response
     * @return {Object}
     */
	async postDeleteResponse(obj) {
		return true;
	}

	/**
     * @param {Object} current required for response
     * @param {Object} obj required for response
     * @return {Object}
     */
	async validateUpdate(current, obj) {
		return null;
	}

	/**
     * @param {Object} obj required for response
     * @return {Object}
     */
	async validateDelete(obj) {
		return null;
	}

	/**
     * @param {Object} obj required for response
     * @return {Object}
     */
	async validateCreate(obj) {
		return null;
	}

	/**
     * @param {Object} obj required for response
     * @return {Object}
     */
	async postCreateResponse(obj) {
		return false;
	}

	/**
     * @param {Object} obj required for response
     * @param {Object} response required for response
     * @return {Object}
     */
	async postUpdateResponse(obj, response) {
		return false;
	}

	/**
     * @param {Object} options required for response
     * @return {Promise<Object>}
     */
	async getApiClientResponse({ model, chatUser, value, code, message, queryParser, pagination, count, token, email }) {
		const meta = AppResponse.getSuccessMeta();
		if (token) {
			meta.token = token;
		}
		_.extend(meta, { status_code: code });
		if (message) {
			meta.message = message;
		}
		if (queryParser && queryParser.population) {
			value = await model.populate(value, queryParser.population);
		}
		if (pagination && !queryParser.getAll) {
			pagination.totalCount = count;
			if (pagination.morePages(count)) {
				pagination.next = pagination.current + 1;
			}
			meta.pagination = pagination.done();
		}
		if (model.hiddenFields && model.hiddenFields.length > 0) {
			const isFunction = typeof value.toJSON === 'function';
			if (_.isArray(value)) {
				value = value.map(v => _.omit((isFunction) ? v.toJSON() : v, ...model.hiddenFields));
			} else {
				value = _.omit((isFunction) ? value.toJSON() : value, ...model.hiddenFields);
			}
		}
		if (email) {
			await sendEmail(email);
		}
		return AppResponse.format(meta, value);
	}

	/**
     * @param {Object} pagination The pagination object
     * @param {Object} queryParser The query parser
     * @return {Object}
     */
	async buildModelQueryObject(pagination, queryParser = null) {
		let query = this.model.find(queryParser.query);
		if (queryParser.search && this.model.searchQuery(queryParser.search).length > 0) {
			const searchQuery = this.model.searchQuery(queryParser.search);
			queryParser.query = {
				$or: [...searchQuery],
				...queryParser.query
			};
			query = this.model.find({...queryParser.query });
		}
		if (!queryParser.getAll) {
			query = query.skip(pagination.skip)
				.limit(pagination.perPage);
		}

		query = query.sort(
			(pagination && pagination.sort) ?
				Object.assign(pagination.sort, { createdAt: -1 }) : '-createdAt');
		return {
			value: await query.select(queryParser.selection).exec(),
			count: await this.model.countDocuments(queryParser.query).exec()
		};
	}

	/**
     * @param {Object} query The query object
     * @return {Promise<Object>}
     */
	async countQueryDocuments(query) {
		let count = await this.model.aggregate(query.concat([{ $count: 'total' }]));
		count = count[0] ? count[0].total : 0;
		return count;
	}

	/**
     * @param {Object} pagination The pagination object
     * @param {Object} query The query
     * @param {Object} queryParser The query parser
     * @return {Object}
     */
	async buildModelAggregateQueryObject(pagination, query, queryParser = null) {
		const count = await this.countQueryDocuments(query);
		query.push({
			$sort: (queryParser.sort) ?
				Object.assign({}, {...queryParser.sort, createdAt: -1 }) : { createdAt: -1 }
		});
		if (!queryParser.getAll) {
			query.push({
				$skip: pagination.skip
			}, {
				$limit: pagination.perPage
			});
		}
		return {
			value: await this.model.aggregate(query).collation({ locale: 'en', strength: 1 }),
			count
		};
	}

	/**
     * @param {Object} obj The payload object
     * @param {Object} session The payload object
     * @return {Object}
     */
	async createNewObject(obj, session = null) {
		const tofill = this.model.fillables;
		if (tofill && tofill.length > 0) {
			obj = _.pick(obj, ...tofill);
		}
		return new this.model(obj).save();
	}

	/**
     * @param {Object} current The payload object
     * @param {Object} obj The payload object
     * @return {Object}
     */
	async updateObject(current, obj) {
		const tofill = this.model.updateFillables || this.model.fillables;
		if (tofill.length > 0) {
			obj = _.pick(obj, ...tofill);
		}
		_.extend(current, obj);
		return current.save();
	}

	/**
     * @param {Object} req The request object
     * @return {Promise<Object>}
     */
	async prepareBodyObject(req) {
		let obj = Object.assign({}, req.body, req.params);
		if (req.authId) {
			const user = req.authId;
			obj = Object.assign(obj, { user }, req.body);
		}
		return obj;
	}

	/**
     * @param {Object} model The model object
     * @param {Object} obj The request object
     * @return {Promise<Object>}
     */
	async retrieveExistingResource(model, obj) {
		if (model.uniques && !_.isEmpty(model.uniques)) {
			const uniqueKeys = model.uniques;
			const query = {};
			for (const key of uniqueKeys) {
				query[key] = obj[key];
			}
			const found = await model.findOne({...query, deleted: false, active: true });
			if (found) {
				return found;
			}
		}
		return null;
	}
}
