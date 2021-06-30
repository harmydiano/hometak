import lang from '../../lang';
import _ from 'lodash';
import AppProcessor from '../_core/app.processor';
import { addHourToDate, generateOTCode, sendEmail, sendMail } from '../../../utils/helpers';
import { PENDING, ONGOING, NOT_FOUND, BAD_REQUEST, UNAUTHORIZED } from '../../../utils/constants';
import AppResponse from '../../../lib/api/app-response';
import AppError from '../../../lib/api/app-error';

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
        
        obj = await _.extend(obj, { bookingId });
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
        if (!merchant) {
            return new AppError(lang.get('merchants').merchant_does_not_exist, NOT_FOUND);
        }
        return true;
    }
}
         

export default BookingProcessor;
