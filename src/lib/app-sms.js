import twilio from 'twilio';
import { TWILIO_SENDER_NAME, TWILIO_USE_SENDER_NAME_FOR } from '../utils/constants';

/**
 * The AppSms class
 */
class AppSms {
	/**
	 * @param {Object} body of the message
	 * @param {String} to the recipient
	 * @param {String} from sender
	 * @return {String} mobileNo
	 */
	static async sendTwilioSms(body, to, from = '') {
		try {
			const accountSid = process.env.TWILIO_ACCOUNT_SID;
			const authToken = process.env.TWILIO_AUTH_TOKEN;
			
			const client = new twilio(accountSid, authToken);
			const recipient = AppSms.formatNumber(to);
			let sender = process.env.TWILIO_SENDER_NUMBER;
			for (let i = 0; i < TWILIO_USE_SENDER_NAME_FOR.length; i++) {
				if (recipient.substring(0, TWILIO_USE_SENDER_NAME_FOR[i].length) === TWILIO_USE_SENDER_NAME_FOR[i]) {
					sender = from || TWILIO_SENDER_NAME;
					break;
				}
			}
			return await client.messages.create({
				body,
				to: recipient,
				from: sender,
			});
		} catch (e) {
			console.log('twilio error >>>>>>>>', e);
		}
	}
	
	/**
	 * @param {String} number The request object
	 * @return {String} mobileNo
	 */
	static formatNumber = number => {
		let mobileNo = number.toString().trim();
		if (mobileNo.substring(0, 1) === '0' && mobileNo.length === 11) {
			mobileNo = `+234${mobileNo.substring(1)}`;
		} else if (mobileNo.substring(0, 1) !== '+') {
			mobileNo = `+${mobileNo}`;
		}
		return mobileNo;
	};
}

export default AppSms;
