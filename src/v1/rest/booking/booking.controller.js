import _ from 'lodash';
import mongoose from 'mongoose';
import { BAD_REQUEST, NOT_FOUND, OK } from '../../../utils/constants';
import AppController from '../_core/app.controller';
import BookingValidation from './booking.validation';
import BookingProcessor from './booking.processor';
import {Merchant} from '../merchant/merchant.model';
import AuthProcessor from '../auth/auth.processor';
import UserProcessor from '../user/user.processor';
import { _extend } from 'util';
import lang from '../../lang';
import AppError from '../../../lib/api/app-error';
console.log(Merchant)

/**
 * BookingController class
 */
class BookingController extends AppController {
    /**
     * @param {Model} model The default model object
     * for the controller. Will be required to create
     * an instance of the controller¬
     */
    constructor(model) {
        super(model);
        this.model = model;
        this.create = this.create.bind(this);
        this.currentUserBooking = this.currentUserBooking.bind(this);
        this.filterCurrentUserBooking = this.filterCurrentUserBooking.bind(this);
    }

    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {void}
     */
    async create(req, res, next) {
        let session = null;
        try {
            session = await mongoose.startSession();
            await session.startTransaction();
            const obj = req.body;
            const validator = await BookingValidation.create(obj);
            if (!validator.passed) {
                return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
            }
            let merchant = await Merchant.findOne({ slug: obj.merchantId });
            //check if payment is successful and merchant store exist
            const verifyError = await BookingProcessor.canVerify(merchant, obj);
            if (verifyError instanceof AppError) {
                return next(verifyError);
            }
            _.extend(obj, { session });
            const auth = await AuthProcessor.create(obj);
            _.extend(obj, { user: auth._id, merchant: merchant._id });
            const user = await UserProcessor.getUser(obj);
             // add verification code to object
            
            const bookingObject = await BookingProcessor.processNewObject(_.omit(obj, ['session']));
            let booking = new this.model(bookingObject);
            await booking.save();
            
            const response = await BookingProcessor.getResponse({
                model: this.model,
                code: OK,
                value: booking,
            });
            // let message = lang.get('email').welcome;
            // // send welcome email
            // let emailError = await sendMail({
            //     user: 'user',
            //     mesage,
            //     email: obj.email,
            //     subject: lang.get('email').welcome_subject,
            //     filename: 'customer-welcome',
            // });
            // if (emailError && typeof emailError === 'object') {
            // 	return next(emailError);
            // }
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
     * @return {void}
     */
    async currentUserBooking(req, res, next) {
       req.query = {merchant: req.authId}
       super.find(req, res, next)
    }

    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {void}
     */
    async filterCurrentUserBooking(req, res, next) {
        console.log('request', req.body)
        _.extend(req.query, {merchant: req.authId, createdAt : {$gte : new Date(req.body.startDate), $lt:new Date(req.body.endDate)}})
        super.find(req, res, next)
     }

}

export default BookingController;
