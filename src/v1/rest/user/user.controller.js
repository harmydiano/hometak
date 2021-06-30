import _ from 'lodash';
import config from 'config';
import UserProcessor from './user.processor';
import { BAD_REQUEST, NOT_FOUND, OK } from '../../../utils/constants';
import AppController from '../_core/app.controller';
import { _extend } from 'util';
import lang from '../../lang';
import AppError from '../../../lib/api/app-error';

/**
 * UserController class
 */
class UserController extends AppController {
    /**
     * @param {Model} model The default model object
     * for the controller. Will be required to create
     * an instance of the controller¬
     */
    constructor(model) {
        super(model);
        this.model = model;
        this.updateMe = this.updateMe.bind(this);
        this.currentUser = this.currentUser.bind(this);
    }

    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     */
    async updateMe(req, res, next) {
        req.object = await this.model.findById(req.authId);
        const authObj =  await this.authModel.findById(req.authId);
        if (req.body.fplPass) {
            authObj.isFplSet = true;
            await authObj.save();
        }
        super.update(req, res, next);
    }

    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {void}
     */
    async currentUser(req, res, next) {
        const user = await this.model.findById(req.authId);
        req.response = {
            model: this.model,
            code: OK,
            value: user,
        };
        return next();
    }

}

export default UserController;
