import Wallet from './wallet.model';
import AppProcessor from '../_core/app.processor';
import AppResponse from '../../../lib/api/app-response';
import _ from 'lodash';

/**
 * The ModuleProcessor class
 */
class WalletProcessor extends AppProcessor {
	/**
	 * @param {String} authId The payload object
	 * @param {Object} session The payload object
	 * @return {Object}
	 */
	static async setWallet(authId, session = null) {
		console.log('hey');
		let wallet = await Wallet.findOne({ _id: authId }).session(session);
		if (!wallet) {
			wallet = await Wallet.findOneAndUpdate({ _id: authId },
				{ _id: authId}, {
					upsert: true,
					new: true,
					setDefaultsOnInsert: true,
					session
				});
		}
		console.log('wallet', wallet);
		return wallet;
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
			return AppResponse.format(meta, value);
		} catch (e) {
			throw e;
		}
	}
}

export default WalletProcessor;
