/**
 * User Schema
 */
import mongoose, { Schema } from 'mongoose';
import StaffProcessor from './staff.processor';
import StaffValidation from './staff.validation';
import AppSchema from '../_core/app.model';

const StaffModel = new AppSchema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Auth'
    },
    merchant: {
        type: Schema.Types.ObjectId,
        ref: 'Merchant'
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    profilePic: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    lga: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        trim: true,
        enum: ['M', 'F']
    },
    dateOfBirth: {
        type: Date,
        trim: true,
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
    autoCreate: true,
    timestamps: true,
    toJSON: { virtuals: true }
});

StaffModel.statics.fillables = [];

/**
 * @return {Object} The validator object with the specified rules.
 */
StaffModel.statics.getValidator = () => {
    return new StaffValidation();
};

/**
 * @param {Model} model required for response
 * @return {Object} The processor class instance object
 */
StaffModel.statics.getProcessor = (model) => {
    return new StaffProcessor(model);
};
/**
 * @typedef StaffModel
 */
export const Staff = mongoose.models.Staff || mongoose.model('Staff', StaffModel);
