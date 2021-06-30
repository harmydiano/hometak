import mongoose, { Schema } from 'mongoose';
import AppSchema from '../../_core/app.model';
import ResourceValidation from '../resource.validation';
import { ResourceProcessor } from '../resource.processor';

/**
 * Experience type Schema
 */
const RoleSchema = new AppSchema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
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

RoleSchema.statics.returnDuplicate = true;
RoleSchema.statics.uniques = ['name'];
RoleSchema.statics.hiddenFields = ['deleted'];

/**
 * @return {Object} The validator object with the specified rules.
 */
RoleSchema.statics.getValidator = () => {
	return new ResourceValidation();
};

/**
 *  @param {String} model The password to compare against
 * @return {Object} The processor class instance object
 */
RoleSchema.statics.getProcessor = (model) => {
	return new ResourceProcessor(model);
};


/**
 * @param {Model} q query string
 * @return {Object} The processor class instance object
 */
RoleSchema.statics.searchQuery = (q) => {
	const regex = new RegExp(q);
	return [
		{ 'name': { $regex: regex, $options: 'i' } }
	];
};

/**
 * @typedef RoleSchema
 */
export default mongoose.model('Role', RoleSchema);
