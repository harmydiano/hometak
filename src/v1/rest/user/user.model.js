/**
 * User Schema
 */
import mongoose, { Schema } from 'mongoose';
import UserProcessor from './user.processor';
import UserValidation from './user.validation';
import AppSchema from '../_core/app.model';

const UserModel = new AppSchema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Auth'
    },
    merchant: {
        type: Schema.Types.ObjectId,
        ref: 'Merchant'
    },
    name: {
        type: String,
        trim: true
    },
    profilePic: {
        type: String,
        trim: true
    },
    mobile: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        enum: ['M', 'F', 'O']
    },
    country: {
        type: String,
        trim: true
    },
    cards: [{
        authorizationCode: String,
        cardType: String,
        lastFour: String,
        expMonth: String,
        expYear: String,
        bin: String,
        bank: String
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

UserModel.statics.fillables = [
    'user',
    'lastName',
    'username',
    'avatar',
    'location',
    'console',
    'games',
    'psnId'
];

const UserCardsModel = new AppSchema({
    id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    authorizationCode: String,
    cardType: String,
    lastFour: String,
    expMonth: String,
    expYear: String,
    bin: String,
    bank: String
});

/**
 * @return {Object} The validator object with the specified rules.
 */
UserModel.statics.getValidator = () => {
    return new UserValidation();
};

/**
 * @param {Model} model required for response
 * @return {Object} The processor class instance object
 */
UserModel.statics.getProcessor = (model) => {
    return new UserProcessor(model);
};
/**
 * @typedef UserModel
 */
export const User = mongoose.models.User || mongoose.model('User', UserModel);
export const UserCard = mongoose.models.UserCard || mongoose.model('UserCard', UserCardsModel);
