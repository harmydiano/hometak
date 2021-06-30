import lang from '../../lang';
import AuthProcessor from '../auth/auth.processor';
import UserValidation from './user.validation';
import {User} from './user.model';
import Auth from '../auth/auth.model';
import config from 'config';
import ApiService from '../../../lib/app-request';
import _ from 'lodash';
import AppProcessor from '../_core/app.processor';
import { addHourToDate, generateOTCode, sendEmail, sendMail } from '../../../utils/helpers';
import { PENDING, ONGOING, NOT_FOUND, BAD_REQUEST, UNAUTHORIZED } from '../../../utils/constants';
import AppResponse from '../../../lib/api/app-response';
import AppError from '../../../lib/api/app-error';
import * as fpl from 'fpl-api';

/**
 * The ModuleProcessor class
 */
class UserProcessor extends AppProcessor {
    /**
     * @param {Object} id The object properties
     * @return {Promise<Object>}
     */
    static async extractUserInfo(id) {
        console.log('got here', id);
        const user = await User.findById(id);
        const email = await AuthProcessor.fetchEmail(Auth, id);
        const session = await fpl.fetchSession(email, user.fplPass);
        const currentUser = await fpl.fetchCurrentUser(session);
        return _.extend({}, { session, currentUser });
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
     * @param {Object} obj The payload object
     * @param {Object} session The payload object
     * @return {Object}
     */
    static async getUser(obj) {
        const { user, session } = obj;
        const object = _.pick(obj, ['name']);
        object.user = user;
        _.extend(object, {user, _id:user, merchant: obj.merchant})
        let found = await User.findOne({ _id: user }).session(session);
        if (!found) {
            found = await User.findOneAndUpdate({ _id: user }, { $set: object }, {
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
            let user = await User.findOne({ '_id': authId, 'clientDetails.apiKey': code, 'clientDetails.secretKey': secret })
                .session(session);
            if (!user) {
                user = await User.findOneAndUpdate({ _id: authId }, { '_id': authId, 'clientDetails.apiKey': code, 'clientDetails.secretKey': secret }, {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                    session
                });
            }
            return user;
        }
    /**
	 * @param {Object} id The object properties
	 * @return {Promise<Object>}
	 */
	static async userExist(id) {
		return await User.findOne({ _id: id });
	}
}

export default UserProcessor;
