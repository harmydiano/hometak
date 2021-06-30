/**
 * User Schema
 */
import mongoose, { Schema } from 'mongoose';
import TransactionProcessor from './transaction.processor';
import AppSchema from '../_core/app.model';

const TransactionModel = new AppSchema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Auth'
    },
    transId: {
        type: Number
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking'
    },
    subscriptionId: {
        type: Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    amount: {
        type: Number
    },
    currency: {
        type: String,
        default: 'NGN'
    },
    reference: {
        type: String
    },
    ipAddress: String,
    paymentDetails: {
        authorizationCode: String,
        cardType: String,
        lastFour: String,
        expMonth: String,
        expYear: String,
        bin: String,
        bank: String
    },
    transType: {
        type: String,
        enum: ['fund', 'withdraw', 'debit']
    },
    transMethod: {
        type: String,
        enum: ['bank', 'card', 'wallet']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'failed']
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


/**
 * @param {Model} model required for response
 * @return {Object} The processor class instance object
 */
TransactionModel.statics.getProcessor = (model) => {
    return new TransactionProcessor(model);
};
/**
 * @typedef UserModel
 */
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionModel);
export default Transaction;
