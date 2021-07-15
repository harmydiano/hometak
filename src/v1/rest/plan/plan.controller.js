import _ from 'lodash';
import { BAD_REQUEST, NOT_FOUND, OK } from '../../../utils/constants';
import AppController from '../_core/app.controller';
import { _extend } from 'util';
import lang from '../../lang';
import AppError from '../../../lib/api/app-error';

/**
 * PlanController class
 */
class PlanController extends AppController {
    /**
     * @param {Model} model The default model object
     * for the controller. Will be required to create
     * an instance of the controller¬
     */
    constructor(model) {
        super(model);
        this.model = model;
        this.currentUserPlan = this.currentUserPlan.bind(this);
    }

    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {void}
     */
    async currentUserPlan(req, res, next) {
       req.query = _.extend(req.query, {user: req.authId})
       super.find(req, res, next)
    }

}

export default PlanController;
