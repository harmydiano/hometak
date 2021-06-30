/**
 * Resume Schema
 */
import mongoose, { Schema } from 'mongoose';
import AppSchema from '../_core/app.model';

const MediaSchema = new AppSchema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	file: {
		url: { type: String, required: true },
		key: { type: String, required: true },
		mine_type: { type: String },
	},
}, {
	autoCreate: true,
	timestamps: true
});

/**
 * @typedef MediaSchema
 */
export default mongoose.model('Media', MediaSchema);
