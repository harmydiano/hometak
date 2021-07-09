import QueryParser from '../../../lib/api/query-parser';
import AppError from '../../../lib/api/app-error';
import { BAD_REQUEST, CONFLICT, CREATED, NOT_FOUND, OK } from '../../../utils/constants';
import lang from '../../lang/index';
import _ from 'lodash';
import Pagination from '../../../lib/api/pagination';

/**
 * The App controller class
 */
class AppController {
    /**
     * @param {Model} model The default model object
     * for the controller. Will be required to create
     * an instance of the controller
     */
    constructor(model) {
        if (new.target === AppController) {
            throw new TypeError('Cannot construct Abstract instances directly');
        }
        if (model) {
            this.model = model;
            this.lang = lang.get(model.collection.collectionName);
        }
        this.id = this.id.bind(this);
        this.create = this.create.bind(this);
        this.status = this.status.bind(this);
        this.findOne = this.findOne.bind(this);
        this.searchOne = this.searchOne.bind(this);
        this.find = this.find.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }


    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @param {String} id The id from the url parameter
     * @return {Object} res The response object
     */
    async id(req, res, next, id) {
        // let request = this.model.findOne({ _id: id, deleted: false });
        let request = this.model.findOne({ _id: id });
        if (req.query && req.query.population) {
            request = request.populate(JSON.parse(req.query.population));
        }
        try {
            let object = await request;
            if (object) {
                req.object = object;
                return next();
            }
            const appError = new AppError(this.lang.not_found, NOT_FOUND);
            return next(appError);
        } catch (err) {
            return next(err);
        }
    }

    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {Object} The response object
     */
    async searchOne(req, res, next) {
        const queryParser = new QueryParser(Object.assign({}, req.query));
        const query = _.omit(queryParser.query, ['deleted']);
        let object = null;
        if (!_.isEmpty(query)) {
            object = await this.model.findOne({...query, deleted: false });
        }
        req.response = {
            model: this.model,
            code: OK,
            value: object == null ? null : object
        };
        return next();
    }

    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {Object} The response object
     */
    async findOne(req, res, next) {
        let object = req.object;
        req.response = {
            model: this.model,
            code: OK,
            value: object
        };
        return next();
    }

    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async create(req, res, next) {
        try {
            const processor = this.model.getProcessor(this.model);
            const validate = await this.model.getValidator().create(req.body);
            if (!validate.passed) {
                return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validate.errors));
            }
            const obj = await processor.prepareBodyObject(req);
            let object = await processor.retrieveExistingResource(this.model, obj);
            if (object) {
                const returnIfFound = this.model.returnDuplicate;
                if (returnIfFound) {
                    req.response = {
                        message: this.lang.created,
                        model: this.model,
                        code: CREATED,
                        value: object
                    };
                    return next();
                } else {
                    const messageObj = this.model.uniques.map(m => ({
                        [m]: `${m} must be unique`
                    }));
                    const appError = new AppError(lang.get('error').resource_already_exist, CONFLICT, messageObj);
                    return next(appError);
                }
            } else {
                let checkError = await processor.validateCreate(obj);
                if (checkError) {
                    return next(checkError);
                }
                object = await processor.createNewObject(obj);
            }
            req.response = {
                message: this.lang.created,
                model: this.model,
                code: CREATED,
                value: await object
            };
            const postCreate = await processor.postCreateResponse(object, {
                userId: req.userId,
                model: this.model.collection.collectionName
            });
            if (postCreate) {
                req.response = Object.assign({}, req.response, postCreate);
            }
            return next();
        } catch (err) {
            return next(err);
        }
    }

    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {Object} The response object
     */
    async find(req, res, next) {
        const queryParser = new QueryParser(Object.assign({}, req.query));
        console.log(queryParser);
        const pagination = new Pagination(req.originalUrl);
        const processor = this.model.getProcessor(this.model);
        try {
            const { value, count } = await processor.buildModelQueryObject(pagination, queryParser);
            req.response = {
                model: this.model,
                code: OK,
                value,
                count,
                queryParser,
                pagination
            };
            return next();
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
    async update(req, res, next) {
        try {
            const processor = this.model.getProcessor(this.model);
            let object = req.object;
            const obj = await processor.prepareBodyObject(req);
            const validate = await this.model.getValidator().update(_.omit(obj, ['id', 'user']));
            if (!object) {
                const error = new AppError(lang.get('error').resource_not_found, BAD_REQUEST);
                return next(error);
            }
            if (!validate.passed) {
                const error = new AppError(lang.get('error').inputs, BAD_REQUEST, validate.errors);
                return next(error);
            }
            if (this.model.uniques && this.model.uniques.length > 0 && !_.isEmpty(_.pick(obj, this.model.uniques))) {
                let found = await processor.retrieveExistingResource(this.model, obj);
                if (found) {
                    const messageObj = this.model.uniques.map(m => ({
                        [m]: `${m} must be unique`
                    }));
                    const appError = new AppError(lang.get('error').resource_already_exist, CONFLICT, messageObj);
                    return next(appError);
                }
            }
            let canUpdateError = await processor.validateUpdate(object, obj);
            if (!_.isEmpty(canUpdateError)) {
                return next(canUpdateError);
            }
           // console.log(object, obj);
            object = await processor.updateObject(object, obj);
            req.response = {
                model: this.model,
                code: OK,
                message: this.lang.updated,
                value: object
            };
            const postUpdate = await processor.postUpdateResponse(object, req.response);
            if (postUpdate) {
                req.response = Object.assign({}, req.response, postUpdate);
            }
            return next();
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
    async status(req, res, next) {
        let object = req.object;
        object.active = req.params['status'];
        try {
            req.response = {
                model: this.model,
                code: OK,
                message: this.lang.updated,
                value: await object.save()
            };
            return next();
        } catch (err) {
            return next(err);
        }
    }

    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {Object} The response object
     */
    async delete(req, res, next) {
        let object = req.object;
        try {
            const processor = this.model.getProcessor(this.model);
            let canDeleteError = await processor.validateDelete(object);
            if (!_.isEmpty(canDeleteError)) {
                return next(canDeleteError);
            }
            if (this.model.softDelete) {
                _.extend(object, { deleted: true });
                object = await object.save();
            } else {
                object = await object.remove();
            }
            req.response = {
                model: this.model,
                code: OK,
                value: { _id: object._id },
                message: this.lang.deleted
            };
            const postDelete = await processor.postDeleteResponse(object, {
                userId: req.userId,
                model: this.model.collection.collectionName,
            });
            if (postDelete) {
                req.response = Object.assign({}, req.response, postDelete);
            }
            return next();
        } catch (err) {
            return next(err);
        }
    }
}

export default AppController;
