import lang from '../../lang';
import {Staff} from './staff.model';
import _ from 'lodash';
import AppProcessor from '../_core/app.processor';
import { addHourToDate, generateOTCode, sendEmail, sendMail } from '../../../utils/helpers';
import { PENDING, ONGOING, NOT_FOUND, BAD_REQUEST, UNAUTHORIZED } from '../../../utils/constants';
import AppResponse from '../../../lib/api/app-response';
import AppError from '../../../lib/api/app-error';

/**
 * The StaffProcessor class
 */
class StaffProcessor extends AppProcessor {

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
     * @param {Object} auth The main property
     * @param {Object} object The object properties
     * @return {Object} returns the api error if main cannot be verified
     */
    static async canVerify(auth, object) {
        if (!auth) {
            return new AppError(lang.get('auth').account_does_not_exist, NOT_FOUND);
        }
        return true;
    }

    /**
     * @param {Object} object The object properties
     * @return {Object} returns the api error if main cannot be verified
     */
    static extractAuthObject(object) {
        return _.pick(object, ["email", "password", "role"]);
    }

    /**
     * @param {Object} obj The payload object
     * @param {Object} session The payload object
     * @return {Object}
     */
    static async getOrUpdateStaff(obj) {
        const { user, session } = obj;
        const objectToUpdate = _.omit(obj, ['session', 'email', 'password', 'verifyCodeExpiration', 'verificationCode', 'role']);
        console.log(objectToUpdate);
        let found = await Staff.findOne({ _id: user }).session(session);
        if (!found) {
            found = await Staff.findOneAndUpdate({ _id: user }, { $set: objectToUpdate }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
                session
            });
        }
        return found;
    }

    /**
	 * @param {Object} id The object properties
	 * @return {Promise<Object>}
	 */
	static async userExist(id) {
		return await Staff.findOne({ _id: id });
	}
}

export default StaffProcessor;
