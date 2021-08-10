import AppProcessor from '../_core/app.processor';
import AppResponse from '../../../lib/api/app-response';
import Stripe from '../../../lib/payment/stripe';
import Flutter from '../../../lib/payment/flutter';
import _ from 'lodash';
import lang from '../../lang';
import config from 'config';
import ApiService from '../../../lib/app-request';
import Transaction from './transaction.model';
import AuthProcessor from "../auth/auth.processor";
import {NotFound, Duplicate,  UnEqual} from './transaction.error';
import { NOT_FOUND, CONFLICT, FAILED, APPROVED, BAD_REQUEST } from '../../../utils/constants';
import { generateOTCode } from '../../../utils/helpers';
import AppError from '../../../lib/api/app-error';


/**
 * The ModuleProcessor class
 */
class TransactionProcessor extends AppProcessor {
    /**
     * @param {Object} req The request object
     * @param {Object} obj The object properties
     * @param {String} status The object properties
     * @return {Promise<Object>}
     */
    static async processNewObject(req, obj, status) {
        const reference = parseInt(generateOTCode(10));
        obj = await _.extend(obj, {
            transId: reference,
            status,
            user: req.authId
        });
        return obj;
    }

    /**
     *  @param {Object} trans The object properties
     * @param {Object} obj The object properties
     */
    static async updateFailedTransaction(trans, obj) {
        obj.status = FAILED;
        trans = _.extend(trans, obj);
        let result = await trans.save();
        // his.updateDashboardTransaction(result);
    }

    /**
     * @param {Object} obj The object properties
     */
    static processPaymentGatewayKey(obj) {
        if (obj.gateway == 'flutter'){
            return obj.subscription 
                ? config.get('flutterwave.public')
                : obj.key
        }
     }

     /**
     * @param {Object} obj The object properties
     */
    static processPaymentGatewaySecret(obj) {
        console.log(config.get('stripe.secret'))
        if (obj.gateway == 'flutter'){
            return obj.subscription 
                ? config.get('flutterwave.secret')
                : obj.secret
        }
        if (obj.gateway == 'stripe'){
            return obj.subscription 
                ? config.get('stripe.secret')
                : obj.secret
        }
     }

    /**
     * @param {Object} obj The object properties
     */
    static processPaymentType(obj, trans) {
        let key;
        let gateway;
        if (obj.currency == 'USD'){
            gateway = 'stripe'
            _.extend(obj, {gateway, subscription: trans.subscriptionId})
            key = this.processPaymentGatewaySecret(obj)
            return new Stripe(key)
        }
        gateway = 'flutter'
        _.extend(obj, {gateway, subscription: trans.subscriptionId})
        key = this.processPaymentGatewayKey(obj)
        let secret = this.processPaymentGatewaySecret(obj)
        return new Flutter(key, secret)
    }

    /**
     * @param {Object} obj The object properties
     */
    static processStripeTransfer() {
        return new Stripe(config.get('stripe.secret'))
    }

    /**
     * @param {Object} obj The object properties
     */
    static async flutterAddSubAccount(obj, response) {
        const keyObj =  _.extend({}, {gateway: 'flutter', subscription: true});
        console.log(keyObj);
        const key = this.processPaymentGatewayKey(keyObj)
        let secret = this.processPaymentGatewaySecret(keyObj)
        const payload = await this.processFlutterSubAccPayload(response.value)
        return await new Flutter(key, secret).addAccount(payload)
    }

    /**
     * @param {Object} obj The object properties
     */
    static async processFlutterSubAccPayload(obj) {
        const auth = await AuthProcessor.isUserExist(obj._id);
        return _.extend({},
            {
                account_bank: obj.account.code,
                account_number: String(obj.account.number),
                business_name: obj.name,
                business_email: auth.email,
                business_contact: obj.name,
                business_contact_mobile: "090890382",
                business_mobile: "09087930450",
                country: obj.country,
                meta: [{"metaname": "MarketplaceID", "metavalue": "ggs-920900"}],
                split_type: "percentage",
                split_value: "0.68"
            })
    }

    /**
     *  @param {Object} trans The object properties
     *  @param {Object} obj The object properties
     */
    static async updateDashboardTransaction(trans, obj) {
            // await MerchantDashboardProcessor.setMerchantTransaction(transObj);
            // await DashboardProcessor.setTransaction(transObj);
        }
 
    /**
     *  @param {Object} trans The object properties
     * @param {Object} obj The object properties
     * @return {Object}
     */
    static async canVerifyErr(trans, obj) {
        console.log('ver', this.canVerify(trans, obj));
        let transErr = this.canVerify(trans, obj);
        if(transErr instanceof Object){
            return transErr.canInitiatePayment();
        }else{
            return;
        }
        
    }

    /**
     *  @param {Object} trans The object properties
     * @param {Object} obj The object properties
     * @return {Object}
     */
    static transactionNotEqual(trans, obj) {
        return trans.transId === obj.transId && 
                trans.amount !== obj.amount &&
                trans.status !== FAILED;
    }

    /**
     *  @param {Object} trans The object properties
     * @param {Object} obj The object properties
     * @return {Object}
     */
    static transactionDuplicate(trans, obj) {
        return trans.transId === obj.transId && 
                trans.status == APPROVED;
    }

    /**
     * @param {Object} trans The main property
     * @param {Object} object The object properties
     * @return {Object} returns the api error if main cannot be verified
     */
    static canVerify(trans, object) {
        /* if (!trans) {
        	return new AppError(lang.get('transactions').transaction_does_not_exist, NOT_FOUND);
        } else if (trans.transId === object.transId && trans.amount !== object.amount) {
        	if (trans.status !== FAILED) await this.updateFailedTransaction(trans, object);
        	return new AppError(lang.get('transactions').failed, BAD_REQUEST);
        } else if (trans.transId === object.transId && trans.status == APPROVED) {
        	return new AppError(lang.get('transactions').duplicate, CONFLICT);
        }*/
        switch (true) {
            case _.isEmpty(trans):
                return new NotFound();
            case this.transactionNotEqual(trans, object):
                return new UnEqual(trans, object);
            case this.transactionDuplicate(trans, object):
                return new Duplicate();
            default:
                return true;
        }
    }

    /**
     * @param {Object} trans The main property
     * @param {Object} id The object properties
     * @return {Object} returns the api error if main cannot be verified
     */
    static async canInitiatePayment(trans, id) {
        if (trans) {
            return new AppError(lang.get('transactions').duplicate, CONFLICT);
        }
        return true;
    }

    /**
     * @param {Object} query The main property
     * @param {Object} options The object properties
     * @return {Object} returns the api error if main cannot be verified
     */
    static dateQueryBuild(query, options){
        let filter = {[`$${options}`]: "$createdAt"};
        if (options == 'day'){
          filter = {$dayOfWeek: "$createdAt"}
        }
        return [
          {
            $match: query
          },
          {
            $project : { 
              [options] : filter,
              amount : 1
            }
          },
          {
            $group :{
              _id :
              {
                [options] : `$${options}`,
              }, 
              total : {
                $sum: "$amount"
              }
            }
        }
    
        ]
      }

    /**
     * @param {Object} obj The main property
     * @return {Object} returns the api error if main cannot be verified
     */
    static async filterTransaction(id, options, transType){
        const user = mongoose.Types.ObjectId(id);
        let query = {user, transType}
        let resultQuerythis;
        if (options == 'daily'){
            resultQuerythis = this.dateQueryBuild(query, 'day')
        }
        if (options == 'monthly') {
            resultQuerythis = this.dateQueryBuild(query, 'month')
        }
        if (options == 'yearly') {
            resultQuerythis = this.dateQueryBuild(query, 'year')
        }
        return await this.model.aggregate(resultQuerythis);
    }

    /**
     * @param {Object} obj The main property
     * @return {Object} returns the api error if main cannot be verified
     */
    static async paymentByUser(obj) {
        const { email, transId } = obj;
        let status = false;
        const query = await Transaction.findOne({
            email,
            transId
        });
        if (!_.isEmpty(query)) {
            status = true;
        }
        return status;
    }

    /**
     * @param {Object} obj The main property
     * @return {Object} returns the api error if main cannot be verified
     */
    static async hasPaid(obj) {
        console.log(obj);
        const found = await Transaction.findOne({
            leagueId: obj.leagueId,
            user: obj.user,
            status: APPROVED
        });
        if (!found) {
            return new AppError(lang.get('transactions').payment_required, BAD_REQUEST);
        }
        return true;
    }

    /**
     * @param {Object} obj The payload object
     * @param {Object} session The payload object
     * @return {Object}
     */
    static async updateTransaction(obj) {
        const { transId, session } = obj;
        const objectToUpdate = _.omit(obj, ['session']);
        console.log(objectToUpdate);
        let found = await Transaction.findOne({ transId: transId }).session(session);
        if (!found) {
            found = await Transaction.findOneAndUpdate({ transId: transId }, { $set: objectToUpdate }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
                session
            });
        }
        return found;
    }

    /**
     * @param {Object} obj The object properties
     * @return {Promise<Object>}
     */
    static async refund(obj) {
        const key = config.get('paystack.key');
        const api = ApiService.init(config.get('paystack.url'));
        const headers = { authorization: `Bearer ${key}` };
        const response = await api.post('refund', _.omit(obj, 'key'), { headers });
        return response;
    }

    /**
     * @param {Object} reference The object properties
     * @return {Promise<Object>}
     */
    static async verifyTransaction(reference) {
        const key = config.get('paystack.key');
        const url = `transaction/verify/${reference}`;
        const api = ApiService.init(config.get('paystack.url'));
        const headers = { authorization: `Bearer ${key}` };
        const response = await api.get(url, { headers });
        return response.status;
    }

    /**
     * @param {Object} options required for response
     * @return {Promise<Object>}
     */
    static async getResponse({ model, value, code, message, count, token, email }) {
        try {
            const meta = AppResponse.getSuccessMeta();
            if (token) {
                meta.token = token;
            }
            _.extend(meta, { status_code: code });
            if (message) {
                meta.message = message;
            }
            return AppResponse.format(meta, value);
        } catch (e) {
            throw e;
        }
    }
}

export default TransactionProcessor;
