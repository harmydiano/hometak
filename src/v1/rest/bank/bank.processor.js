import AppProcessor from '../_core/app.processor';
import config from 'config';
import ApiService from '../../../lib/app-request';
import AppResponse from '../../../lib/api/app-response';
import _ from 'lodash';
import Flutter from '../../../lib/payment/flutter';

/**
 * The BankProcessor class
 */
class BankProcessor extends AppProcessor {
    
    /**
     * @param {Object} obj The object properties
     * @return {Promise<Object>}
     */
    static options() {
        const secret = config.get('flutterwave.secret');
        const key = config.get('flutterwave.public');
        return new Flutter(key, secret)
    }

    /**
     * @param {Object} obj The object properties
     * @return {Promise<Object>}
     */
    static async fetchBanks(payload) {
        const flutter = this.options();
        return flutter.fetchBanks(payload);
    }

    /**
     * @param {Object} obj The object properties
     * @return {Promise<Object>}
     */
    static async resolveAccount(payload) {
        const flutter = this.options();
        return flutter.resolveAccount(payload);
    }
  
  
    /**
     * @param {Object} options required for response
     * @return {Promise<Object>}
     */
    static async getResponse({ model, value, code, message, count, token, email }) {
        try {
            // console.log(value);
            const meta = AppResponse.getSuccessMeta();
            if (token) {
                meta.token = token;
            }
            _.extend(meta, { status_code: code });
            if (message) {
                meta.message = message;
            }
            return AppResponse.format(meta, value);
        } catch (e) {
            throw e;
        }
    }
}

export default BankProcessor;
