import lang from '../../lang';
import {Cleaners} from './cleaners.model';
import _ from 'lodash';
import AppProcessor from '../_core/app.processor';
import { addHourToDate, generateOTCode, sendEmail, sendMail } from '../../../utils/helpers';
import { PENDING, ONGOING, NOT_FOUND, BAD_REQUEST, UNAUTHORIZED } from '../../../utils/constants';
import AppResponse from '../../../lib/api/app-response';
import AppError from '../../../lib/api/app-error';

/**
 * The CleanersProcessor class
 */
class CleanersProcessor extends AppProcessor {

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
     * @param {Object} object The object properties
     * @return {Object} returns the location query
     */
    static processLocationObj(long, latt) {
        return {
          location: {
            type: "Point",
            coordinates: [long, latt],
          },
        };
    }

     /**
     * @param {Object} object The object properties
     * @return {Object} returns the location query
     */
    static locationQuery(obj) {
        return {
          $near: {
            $minDistance: MIN_DISTANCE,
            $maxDistance: MAX_DISTANCE,
            $geometry: {
              type: "Point",
              coordinates: [obj.long, obj.latt],
            },
          },
        };
    }

    /**
     * @param {Object} obj The payload object
     * @param {Object} session The payload object
     * @return {Object}
     */
    static async getOrUpdateCleaner(obj) {
        const { user, session } = obj;
        const objectToUpdate = _.omit(obj, ['session', 'email', 'password', 'verifyCodeExpiration', 'verificationCode', 'role']);
        console.log(objectToUpdate);
        const {lat, lng} = await fetchCoordsfromAddress(obj.address);
        const locationCordinates = this.processLocationObj(lng, lat)
        _.extend(location, locationCordinates)
        let found = await Cleaners.findOne({ _id: user }).session(session);
        if (!found) {
            found = await Cleaners.findOneAndUpdate({ _id: user }, { $set: objectToUpdate }, {
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
		return await Merchant.findOne({ _id: id });
    }
    
    /**
	 * @param {Object} id The object properties
	 * @return {Promise<Object>}
	 */
	static async findCleanersByLocation(obj) {
        const locationQuery = this.locationQuery(obj)
		return await Cleaners.findOne({ merchant, location: locationQuery});
	}
}

export default CleanersProcessor;
