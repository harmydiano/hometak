import _ from 'lodash';
import config from 'config';
import mongoose from 'mongoose';
import CleanersProcessor from './cleaners.processor';
import WalletProcessor from '../wallet/wallet.processor';
import AuthProcessor from '../auth/auth.processor';
import Auth from '../auth/auth.model';
import CleanersValidation from './cleaners.validation';
import { BAD_REQUEST, CLEANER, OK, DEFAULT_PASS} from '../../../utils/constants';
import AppController from '../_core/app.controller';
import { _extend } from 'util';
import lang from '../../lang';
import AppError from '../../../lib/api/app-error';

/**
 * CleanersController class
 */
class CleanersController extends AppController {
    /**
     * @param {Model} model The default model object
     * for the controller. Will be required to create
     * an instance of the controller¬
     */
    constructor(model) {
        super(model);
        this.model = model;
        this.create = this.create.bind(this);
        this.updateMe = this.updateMe.bind(this);
        this.currentUser = this.currentUser.bind(this);
    }

    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     */
    async create(req, res, next) {
        let session = null;
        try {
            session = await mongoose.startSession();
            await session.startTransaction();
            const obj = req.body;
            const validator = await new CleanersValidation().register(obj);
            if (!validator.passed) {
                return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
            }
            const authFound = await Auth.findOne({ email: obj.email }).select('+password');
            const canSignup = await AuthProcessor.canVerify(authFound, obj);
            if (canSignup instanceof AppError) {
                return next(canSignup);
            }
            obj.role = CLEANER;
            obj.password = DEFAULT_PASS;
            const authObject = CleanersProcessor.extractAuthObject(obj);
            const auth = new Auth(authObject);
            await auth.save({ session });
            _.extend(obj, {
                user: auth._id,
                merchant: req.authId,
                session,
            });
            const cleaners = await CleanersProcessor.getOrUpdateCleaner(obj);
            await WalletProcessor.setWallet(auth._id, session);
            const response = await CleanersProcessor.getResponse({
                model: this.model,
                code: OK,
                value: cleaners,
            });
            await session.commitTransaction();
            return res.status(OK).json(response);
        } catch (e) {
            await session.abortTransaction();
            return next(e);
        }
    }

    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     */
    async updateMe(req, res, next) {
        req.object = await this.model.findById(req.authId);
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

export default CleanersController;
