import util from 'util';
import { Schema } from 'mongoose';
import AppValidation from './app.validation';
import AppProcessor from './app.processor';

/**
 * The Base types object where other types inherits or
 * overrides pre defined and static methods
 */
function AppSchema(...args) {
	Schema.apply(this, args);
	
	this.statics.softDelete = true;
	this.statics.uniques = [];
	this.statics.returnDuplicate = false;
	this.statics.fillables = [];
	this.statics.updateFillables = [];
	this.statics.hiddenFields = [];
	
	/**
	 * @return {Object} The validator object with the specified rules.
	 */
	this.statics.getValidator = () => {
		return new AppValidation();
	};
	
	/**
	 *  @param {Model} model The password to compare against
	 * @return {Object} The processor class instance object
	 */
	this.statics.getProcessor = (model) => {
		return new AppProcessor(model);
	};
}

util.inherits(AppSchema, Schema);
/**
 * @typedef AppSchema
 */
export default AppSchema;
