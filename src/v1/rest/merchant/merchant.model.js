/**
 * User Schema
 */
import mongoose, { Schema } from 'mongoose';
import UserProcessor from './merchant.processor';
import UserValidation from './merchant.validation';
import AppSchema from '../_core/app.model';

const MerchantModel = new AppSchema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Auth'
    },
    name: {
        type: String,
        trim: true
    },
    slug: {
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
    brandColor: {
        type: String,
        trim: true
    },
    regNo: {
        type: String,
        trim: true
    },
    regStatus: {
        type: Boolean,
        trim: false
    },
    document: {
        name: {
            type: String,
            trim: true,
            default: null
        },
        type: {
            type: String,
            trim: true,
            default: null
        },
        url: {
            type: String,
            trim: true,
            default: null
        }
    },
    operation: {
        from: {
            type: String,
            trim: true,
            default: null
        },
        to: {
            type: String,
            trim: true,
            default: null
        },
        openHours: {
            type: String,
            trim: true,
            default: null
        },
        closeHours: {
            type: String,
            trim: true,
            default: null
        }
    },
    account: {
        name: {
            type: String,
            trim: true,
            default: null
        },
        code: {
            type: String,
            default: null
        },
        number: {
            type: Number,
            default: 0
        },
        bank: {
            type: String,
            trim: true,
            default: null
        }
    },
    serviceLocations: [{
        location: String,
        postal: String
    }],
    country: {
        type: String,
        trim: true
    },
    subscriptionPlan: {
        type: String,
        trim: true
    },
    subscriptionId: {
        type: String,
        ref: 'Subscription'
    },
    flutterId: {
        type: String,
    },
    bookingLimit: {
        type: Number,
        default: 15
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

MerchantModel.statics.fillables = [
    'user',
    'lastName',
    'username',
    'avatar',
    'location',
    'console',
    'games',
    'psnId'
];

const MerchantCardsModel = new AppSchema({
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
MerchantModel.statics.getValidator = () => {
    return new UserValidation();
};

/**
 * @param {Model} model required for response
 * @return {Object} The processor class instance object
 */
MerchantModel.statics.getProcessor = (model) => {
    return new UserProcessor(model);
};
/**
 * @typedef MerchantModel
 */
export const Merchant = mongoose.models.Merchant || mongoose.model('Merchant', MerchantModel);
export const MerchantCard = mongoose.models.MerchantCard || mongoose.model('MerchantCard', MerchantCardsModel);
