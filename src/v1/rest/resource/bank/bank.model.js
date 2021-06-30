import mongoose, { Schema } from 'mongoose';
import AppSchema from '../../_core/app.model';
import { ResourceProcessor } from '../resource.processor';
import BankValidation from './bank.validation';

/**
 * Experience type Schema
 */
const BankSchema = new AppSchema({
	user: {
		type: Schema.Types.ObjectId
	},
	name: {
		type: String,
		required: true,
	},
	slug: {
		type: String,
	},
	code: {
		type: String,
	},
	longCode: String,
	gateway: String,
	country: {
		type: String,
		default: 'NG'
	},
	type: String,
	order: {
		type: Number,
		index: true
	},
	isCreatedByUser: {
		type: Boolean,
		default: false,
	},
	active: {
		type: Boolean,
		default: true,
	},
	deleted: {
		type: Boolean,
		default: false,
		select: false,
	},
}, {
	timestamps: true,
});

BankSchema.statics.returnDuplicate = true;
BankSchema.statics.uniques = ['name'];
BankSchema.statics.hiddenFields = ['deleted'];

/**
 * @return {Object} The validator object with the specified rules.
 */
BankSchema.statics.getValidator = () => {
	return new BankValidation();
};

/**
 *  @param {String} model The password to compare against
 * @return {Object} The processor class instance object
 */
BankSchema.statics.getProcessor = (model) => {
	return new ResourceProcessor(model);
};


/**
 * @param {Model} q query string
 * @return {Object} The processor class instance object
 */
BankSchema.statics.searchQuery = (q) => {
	const regex = new RegExp(q);
	return [
		{ 'name': { $regex: regex, $options: 'i' } }
	];
};

/**
 * @typedef BankSchema
 */
export default mongoose.model('Bank', BankSchema);
