/**
 * User Schema
 */
import mongoose, { Schema } from 'mongoose';
import BookingProcessor from './booking.processor';
import BookingValidation from './booking.validation';
import AppSchema from '../_core/app.model';

const BookingModel = new AppSchema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Auth'
    },
    merchant: {
        type: Schema.Types.ObjectId,
        ref: 'Merchant'
    },
    bookingId: {
        type: String
    },
    location: {
        type: String,
        trim: true,
        default: null
    },
    postal: {
        type: String,
        trim: true,
        default: null
    },
    address: {
        type: String,
        trim: true,
        default: null
    },
    planName: {
        type: String,
        trim: true
    },
    plan: {
        type: Schema.Types.ObjectId,
        ref: 'Plan'
    },
    planName: {
        type: String,
        trim: true
    },
    noOfRoom: {
        type: Number
    },
    addOns: [{
        name: String,
        quantity: Number,
        price: Number
    }],
    date: {
        type: Date
    },
    time: {
        type: String,
        trim: true
    },
    additionalNotes: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'ongoing', 'cancelled', 'completed'],
        default: 'pending'
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

BookingModel.statics.fillables = [];

/**
 * @return {Object} The validator object with the specified rules.
 */
BookingModel.statics.getValidator = () => {
    return BookingValidation;
};

/**
 * @param {Model} model required for response
 * @return {Object} The processor class instance object
 */
BookingModel.statics.getProcessor = (model) => {
    return new BookingProcessor(model);
};
/**
 * @typedef BookingModel
 */
export const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingModel);
