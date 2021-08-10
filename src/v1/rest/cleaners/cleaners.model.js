/**
 * User Schema
 */
import mongoose, { Schema } from 'mongoose';
import CleanersProcessor from './cleaners.processor';
import CleanersValidation from './cleaners.validation';
import AppSchema from '../_core/app.model';

const CleanersModel = new AppSchema({
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
    location: {
        type: { type: String },
        coordinates: []
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

CleanersModel.statics.fillables = [];

/**
 * @return {Object} The validator object with the specified rules.
 */
CleanersModel.statics.getValidator = () => {
    return new CleanersValidation();
};

/**
 * @param {Model} model required for response
 * @return {Object} The processor class instance object
 */
CleanersModel.statics.getProcessor = (model) => {
    return new CleanersProcessor(model);
};
/**
 * @typedef CleanersModel
 */
export const Cleaners = mongoose.models.Cleaners || mongoose.model('Cleaners', CleanersModel);
