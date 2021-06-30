import mongoose, { Schema } from 'mongoose';
import AppSchema from '../../_core/app.model';
import SubscriptionValidation from './subscription.validation'
import { ResourceProcessor } from '../resource.processor';

/**
 * Experience type Schema
 */
const SubscriptionSchema = new AppSchema({
	name: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
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

SubscriptionSchema.statics.returnDuplicate = true;
SubscriptionSchema.statics.uniques = ['name'];
SubscriptionSchema.statics.hiddenFields = ['deleted'];

/**
 * @return {Object} The validator object with the specified rules.
 */
SubscriptionSchema.statics.getValidator = () => {
	return new SubscriptionValidation();
};

/**
 *  @param {String} model The password to compare against
 * @return {Object} The processor class instance object
 */
SubscriptionSchema.statics.getProcessor = (model) => {
	return new ResourceProcessor(model);
};


/**
 * @param {Model} q query string
 * @return {Object} The processor class instance object
 */
SubscriptionSchema.statics.searchQuery = (q) => {
	const regex = new RegExp(q);
	return [
		{ 'name': { $regex: regex, $options: 'i' } }
	];
};

/**
 * @typedef SubscriptionSchema
 */
export default mongoose.model('Subscription', SubscriptionSchema);
