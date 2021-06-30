import AppController from '../_core/app.controller';
import _ from 'lodash';
import TransactionProcessor from './transaction.processor';
import TransactionValidation from './transaction.validation';
import { BAD_REQUEST, NOT_FOUND, OK, PENDING, APPROVED } from '../../../utils/constants';
import lang from '../../lang';
import mongoose from 'mongoose';

import AppError from '../../../lib/api/app-error';

/**
 *  TransactionController
 */
class TransactionController extends AppController {
    /**
     * @param {Model} model The default model object
     * for the controller. Will be required to create
     * an instance of the controller¬
     */
    constructor(model) {
        super(model);
        this.create = this.create.bind(this);
        this.store = this.store.bind(this);
        this.charge = this.charge.bind(this);
        this.transfer = this.transfer.bind(this)
        this.refund = this.refund.bind(this);
    }

    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async create(req, res, next) {
        let session = null;
        try {
            session = await mongoose.startSession();
            await session.startTransaction();
            let obj = req.body;
            const validator = await TransactionValidation.create(obj);
            if (!validator.passed) {
                return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
            }
            const transQuery = await this.model.findOne({
                user: req.authId,
                leagueId: obj.bookingId,
                status: PENDING
            });
            const paymentRefError = await TransactionProcessor.canInitiatePayment(transQuery, obj.leagueId);
            console.log(paymentRefError);
            if (paymentRefError instanceof AppError) {
                return next(paymentRefError);
            }
            obj = await TransactionProcessor.processNewObject(req, obj, PENDING);

            const savedTrans = await this.model.findOneAndUpdate({ transId: obj.transId }, { $set: obj }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
                session
            });

            const response = await TransactionProcessor.getResponse({
                model: this.model,
                code: OK,
                value: _.pick(savedTrans, ['_id', 'amount', 'transId']),
            });
            await session.commitTransaction();
            return res.status(OK).json(response);
        } catch (err) {
            await session.abortTransaction();
            return next(err);
        }
    }

     /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async charge(req, res, next) {
        let session = null;
        try {
            session = await mongoose.startSession();
            await session.startTransaction();
            let obj = req.body;
            const validator = await TransactionValidation.charge(obj);
            if (!validator.passed) {
                return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
            }
            let trans = await this.model.findOne({
                transId: obj.transId,
                user: req.authId,
                status: PENDING
            }).session(session);

            const paymentRefError = await TransactionProcessor.canVerifyErr(trans, obj);
            if (paymentRefError instanceof AppError) {
                return next(paymentRefError);
            }
            const transaction = TransactionProcessor.processPaymentType(obj, trans)
            const processedTransaction = await transaction.charge(obj)
            console.log('trans', processedTransaction)
            obj = await TransactionProcessor.processNewObject(req, obj, APPROVED);
            trans = _.extend(trans, obj);
            const savedTransaction = await trans.save();

            // const sessionWithObj = _.extend(trans.toObject({ getters: true }), { session });
            // await TransactionProcessor.updateDashboardTransaction(sessionWithObj);

            const response = await TransactionProcessor.getResponse({
                model: this.model,
                code: OK,
                value: _.pick(savedTransaction, ['_id', 'amount', 'transId', 'status']),
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
     * @return {Object} res The response object
     */
    async transfer(req, res, next) {
        let session = null;
        try {
            session = await mongoose.startSession();
            await session.startTransaction();
            let obj = req.body;
            const validator = await TransactionValidation.transfer(obj);
            if (!validator.passed) {
                return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
            }
            // let trans = await this.model.findOne({
            //     transId: obj.transId,
            //     user: req.authId,
            //     status: PENDING
            // }).session(session);

            // const paymentRefError = await TransactionProcessor.canVerifyErr(trans, obj);
            // if (paymentRefError instanceof AppError) {
            //     return next(paymentRefError);
            // }
            const transaction = TransactionProcessor.processStripeTransfer()
            const processedTransaction = await transaction.transfer(obj)
            console.log('trans', processedTransaction)

            // const sessionWithObj = _.extend(trans.toObject({ getters: true }), { session });
            // await TransactionProcessor.updateDashboardTransaction(sessionWithObj);

            const response = await TransactionProcessor.getResponse({
                model: this.model,
                code: OK,
                value: _.pick(savedTransaction, ['_id', 'amount', 'transId', 'status']),
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
     * @return {Object} res The response object
     */
    async store(req, res, next) {
        let session = null;
        try {
            session = await mongoose.startSession();
            await session.startTransaction();
            let obj = req.body;
            const validator = await TransactionValidation.store(obj);
            if (!validator.passed) {
                return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
            }
            let trans = await this.model.findOne({
                transId: obj.transId,
                user: req.authId,
                status: PENDING
            }).session(session);

            const paymentRefError = await TransactionProcessor.canVerifyErr(trans, obj);
            if (paymentRefError instanceof AppError) {
                return next(paymentRefError);
            }
            obj = await TransactionProcessor.processNewObject(req, obj, APPROVED);
            trans = _.extend(trans, obj);
            const savedTransaction = await trans.save();

            // const sessionWithObj = _.extend(trans.toObject({ getters: true }), { session });
            // await TransactionProcessor.updateDashboardTransaction(sessionWithObj);

            const response = await TransactionProcessor.getResponse({
                model: this.model,
                code: OK,
                value: _.pick(savedTransaction, ['_id', 'amount', 'transId', 'status']),
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
     * @return {Object} res The response object
     */
    async refund(req, res, next) {
            let session = null;
            try {
                session = await mongoose.startSession();
                await session.startTransaction();
                let obj = req.body;
                const validator = await TransactionValidation.refund(obj);
                if (!validator.passed) {
                    return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
                }
                let trans = await this.model.findOne({
                    'paymentDetails.authorizationCode': obj.authorizationCode,
                    'user': req.authId,
                    'status': APPROVED
                }).session(session);

                const paymentRefError = await TransactionProcessor.canVerify(trans, obj);
                if (paymentRefError instanceof AppError) {
                    return next(paymentRefError);
                }
                const result = await TransactionProcessor.refund(obj);
                const response = await TransactionProcessor.getResponse({
                    model: this.model,
                    code: OK,
                    value: result,
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
    async merchant(req, res, next) {
        req.query = _.extend(req.query, { user: req.authId });
        super.find(req, res, next);
    }
}

export default TransactionController;
