import lang from '../../lang';
import {Merchant} from './merchant.model';
import _ from 'lodash';
import AppProcessor from '../_core/app.processor';
import TransactionProcessor from '../transaction/transaction.processor';
import { addHourToDate, generateOTCode, sendEmail, sendMail } from '../../../utils/helpers';
import { PENDING, ONGOING, NOT_FOUND, BAD_REQUEST, UNAUTHORIZED } from '../../../utils/constants';
import AppResponse from '../../../lib/api/app-response';
import AppError from '../../../lib/api/app-error';

/**
 * The MerchantProcessor class
 */
class MerchantProcessor extends AppProcessor {
    /**
     * @param {Object} obj The object properties
     * @return {Promise<Object>}
     */
    async processNewObject(obj) {
        obj.verifyCodeExpiration = addHourToDate(1);
        const code = 1234;
        // const code = generateOTCode(4);
        obj = await _.extend(obj, { verificationCode: code });
        return obj;
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
     * @param {Object} obj required for response
     * @param {Object} response required for response
     * @return {Object}
     */
	async postUpdateResponse(obj, response) {
        if (!_.isEmpty(obj.account) && _.isEmpty(response.value.flutterId)){
            const savedSubAccount = await TransactionProcessor.flutterAddSubAccount(obj, response);
            if (!_.isEmpty(savedSubAccount)){
                const updated = await Merchant.findOneAndUpdate({ _id: response._id }, { $set: {flutterId: savedSubAccount.data.subaccount_id} }, {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                    session
                });
                console.log(updated)
            }
            
        }
		return false;
	}


    /**
     * @param {Object} obj The payload object
     * @param {Object} session The payload object
     * @return {Object}
     */
    static async getUser(obj) {
        const { user, session } = obj;
        const objectToUpdate = _.omit(obj, ['session', 'email', 'password', 'verifyCodeExpiration', 'verificationCode', 'role']);
        console.log(objectToUpdate);
        let found = await Merchant.findOne({ _id: user }).session(session);
        if (!found) {
            found = await Merchant.findOneAndUpdate({ _id: user }, { $set: objectToUpdate }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
                session
            });
        }
        return found;
    }

    /**
     * @param {String} authId The payload object
     * @param {Object} session The payload object
     * @return {Object}
     */
    static async getClient(authId, session = null) {
            let code = generateOTCode(10, true).toLocaleUpperCase();
            code = `ET_TEST_${code}`;
            const secret = generateOTCode(30, true).toLocaleUpperCase();
            let merchant = await Merchant.findOne({ '_id': authId, 'clientDetails.apiKey': code, 'clientDetails.secretKey': secret })
                .session(session);
            if (!merchant) {
                merchant = await Merchant.findOneAndUpdate({ _id: authId }, { '_id': authId, 'clientDetails.apiKey': code, 'clientDetails.secretKey': secret }, {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                    session
                });
            }
            return user;
        }
        /**
         * @param {String} obj The payload object
         * @return {Object}
         */
    static extractFbData(obj) {
            const firstName = obj.name.givenName;
            const lastName = obj.name.familyName;
            return _.extend({}, { firstName, lastName });
        }
        /**
         * @param {String} obj The payload object
         * @return {Object}
         */
    static extractGmailData(obj) {
            console.log(obj);
            const firstName = obj.name.givenName;
            const lastName = obj.name.familyName;
            return _.extend({}, { firstName, lastName });
        }
        /**
         * @param {String} authId The payload object
         * @param {String} obj The payload object
         * @return {Object}
         */
    static async fbLogin(authId, obj) {
            const result = await User.findOneAndUpdate({
                    user: authId
                },
                obj, {
                    upsert: true,
                    new: true
                }
            );
            return result;
        }

    /**
	 * @param {Object} id The object properties
	 * @return {Promise<Object>}
	 */
	static async userExist(id) {
		return await Merchant.findOne({ _id: id });
	}
}

export default MerchantProcessor;
