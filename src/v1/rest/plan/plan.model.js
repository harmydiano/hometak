/**
 * User Schema
 */
import mongoose, { Schema } from 'mongoose';
import PlanProcessor from './plan.processor';
import PlanValidation from './plan.validation';
import AppSchema from '../_core/app.model';

const PlanModel = new AppSchema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Auth'
    },
    name: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        trim: true
    },
    frequency: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    pricing: {
        option: {
            type: String,
            trim: true,
            default: null
        },
        amount: {
            type: Number,
            trim: true,
            default: 0
        }
    },
    addOns: [{
        name: String,
        price: Number
    }],
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

PlanModel.statics.fillables = [];

/**
 * @return {Object} The validator object with the specified rules.
 */
PlanModel.statics.getValidator = () => {
    return new PlanValidation();
};

/**
 * @param {Model} model required for response
 * @return {Object} The processor class instance object
 */
PlanModel.statics.getProcessor = (model) => {
    return new PlanProcessor(model);
};
/**
 * @typedef PlanModel
 */
export const Plan = mongoose.models.Plan || mongoose.model('Plan', PlanModel);
