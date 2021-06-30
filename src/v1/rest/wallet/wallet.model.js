/**
 * User Schema
 */
import mongoose, { Schema } from 'mongoose';
import WalletProcessor from './wallet.processor';
import AppSchema from '../_core/app.model';

const WalletModel = new AppSchema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'Auth'
	},
	availableBalance: {
		type: Number,
		default: '1000000000'
	},
	amount: {
		type: Number,
		default: '1000000000',
	},
}, {
	autoCreate: true,
	timestamps: true,
	toJSON: { virtuals: true }
});


/**
 * @param {Model} model required for response
 * @return {Object} The processor class instance object
 */
WalletModel.statics.getProcessor = (model) => {
	return new WalletProcessor(model);
};
/**
 * @typedef UserModel
 */
const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', WalletModel);
export default Wallet;
