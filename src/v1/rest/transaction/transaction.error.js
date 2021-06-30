import AppProcessor from '../_core/app.processor';
import AppResponse from '../../../lib/api/app-response';
import _ from 'lodash';
import lang from '../../lang';
import config from 'config';
import ApiService from '../../../lib/app-request';
import Transaction from './transaction.model';
import TransactionProcessor from './transaction.processor';
import { NOT_FOUND, CONFLICT, FAILED, APPROVED, BAD_REQUEST } from '../../../utils/constants';
import { generateOTCode } from '../../../utils/helpers';
import AppError from '../../../lib/api/app-error';

/**
 * The ModuleProcessor class
 */
class PaymentErr {
    /**
     * for the controller. Will be required to create
     * an instance of the controller¬
     */
    constructor() {
        if (this.constructor === PaymentErr) {
            throw new TypeError('Abstract class "PaymentErr" cannot be instantiated directly.');
        }
    }

    /**
     * @return {Object} res The response object
     */
    canInitiatePayment() {
        return 0;
    }
}

/**
 * The ModuleProcessor class
 */
export class NotFound extends PaymentErr {
    /**
     * @param {Object} trans The default model object
     * for the controller. Will be required to create
     * an instance of the controller¬
     */
    constructor(trans) {
            super();
            this.trans = trans;
            this.canInitiatePayment = this.canInitiatePayment.bind(this);
        }
        /**
         * @return {Object} res The response object
         */
    canInitiatePayment() {
        return new AppError(lang.get('transactions').transaction_does_not_exist, NOT_FOUND);
        
    }
}

/**
 * The ModuleProcessor class
 */
export class Duplicate extends PaymentErr {
    /**
     * @param {Object} trans The default model object
     * @param {Object} obj The default model object
     * for the controller. Will be required to create
     * an instance of the controller¬
     */
    constructor(trans, obj) {
            super();
            this.trans = trans;
            this.obj = obj;
            this.canInitiatePayment = this.canInitiatePayment.bind(this);
        }
        /**
         * @return {Object} res The response object
         */
    canInitiatePayment() {
        return new AppError(lang.get('transactions').duplicate, CONFLICT);
    }
}

/**
 * The ModuleProcessor class
 */
export class UnEqual extends PaymentErr {
    /**
     * @param {Object} trans The default model object
     * @param {Object} obj The default model object
     * for the controller. Will be required to create
     * an instance of the controller¬
     */
    constructor(trans, obj) {
            super();
            this.trans = trans;
            this.obj = obj;
            this.canInitiatePayment = this.canInitiatePayment.bind(this);
        }
        /**
         * @return {Object} res The response object
         */
    async canInitiatePayment() {
        await TransactionProcessor.updateFailedTransaction(this.trans, this.obj);
        return new AppError(lang.get('transactions').failed, BAD_REQUEST);
    }
}

/**
 * The ModuleProcessor class
 */
export class TransactionRefVerification extends PaymentErr {
    /**
     * @param {Object} reference The default model object
     * for the controller. Will be required to create
     * an instance of the controller¬
     */
    constructor(reference) {
            super();
            this.reference = reference;
        }
        /**
         * @return {Object} res The response object
         */
    async canInitiatePayment() {
        if (!await TransactionProcessor.verifyTransaction(this.reference)) {
            await TransactionProcessor.updateFailedTransaction(this.trans, this.object);
            return new AppError(lang.get('transactions').failed, BAD_REQUEST);
        }
    }
}
