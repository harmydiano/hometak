import lang from '../../lang';
import _ from 'lodash';
import AppProcessor from '../_core/app.processor';
import { addHourToDate, generateOTCode, sendEmail, sendMail } from '../../../utils/helpers';
import { PENDING, CREDIT, ONGOING, NOT_FOUND, BAD_REQUEST, UNAUTHORIZED } from '../../../utils/constants';
import AppResponse from '../../../lib/api/app-response';
import AppError from '../../../lib/api/app-error';
import {fetchCoordsfromAddress} from '../../../utils/helpers';
import CleanersProcessor from '../cleaners/cleaners.processor';
import TransactionProcessor from '../transaction/transaction.processor';

/**
 * The BookingProcessor class
 */
class BookingProcessor extends AppProcessor {
    /**
     * @param {Object} obj The object properties
     * @return {Promise<Object>}
     */
    static async processNewObject(obj) {
        const code = generateOTCode(8, true);
        const word = obj.merchantId.substring(0, 3);
        const bookingId = word + code;
        const {lat, lng} = await fetchCoordsfromAddress(obj.address) || {};
        const nearByClearnerInfo = await CleanersProcessor.findCleanersByLocation(obj)
        if (!_.isEmpty(nearByClearnerInfo)){
            _.extend(obj, {bookingAssingnedTo: nearByClearnerInfo._id})
            //send email to cleaner / SMS
        }
        _.extend(obj, { bookingId, lat, lng});
        return _.omit(obj, ['name', 'email']);
    }

    /**
     * @param {Object} options required for response
     * @return {Promise<Object>}
     */
    static async getResponse({ model, value, code, message, count, token, email }) {
        try {
            const meta = AppResponse.getSuccessMeta();
            if (token) {
                meta.token = token;
            }
            _.extend(meta, { status_code: code });
            if (message) {
                meta.message = message;
            }
            if (model.hiddenFields && model.hiddenFields.length > 0) {
                value = _.omit(value.toJSON(), ...model.hiddenFields);
            }

            return AppResponse.format(meta, value);
        } catch (e) {
            throw e;
        }
    }

    /**
     * @param {Object} merchant The main property
     * @param {Object} object The object properties
     * @return {Object} returns the api error if main cannot be verified
     */
    static async canVerify(merchant, object) {
        const userPaymentStatus = await TransactionProcessor.paymentByUser({email: object.email, transId: object.transId})
        if (!merchant) {
            return new AppError(lang.get('merchants').merchant_does_not_exist, BAD_REQUEST);
        }
        if (!userPaymentStatus){
            return new AppError(lang.get('transactions').cannot_confirm, BAD_REQUEST);
        }
        return true;
    }

    /**
     * @param {Object} merchant The main property
     * @param {Object} object The object properties
     * @return {Object} returns the api error if main cannot be verified
     */
    static async setMerchantTransaction(merchant, object) {
        const obj = {
            merchant,
            status: PENDING,
            transType: CREDIT,
            transId: object.transId,
            bookingId: object.bookingId
        }
        const paymentUpdate = await TransactionProcessor.updateTransaction(obj)
        console.log(paymentUpdate)
    }
}
         

export default BookingProcessor;
