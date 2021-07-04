import Auth from './auth.model';
import AuthValidation from './auth.validation';
import AuthProcessor from './auth.processor';
import _ from 'lodash';
import lang from '../../lang';
import mongoose from 'mongoose';
import config from 'config';
import passport from 'passport';
import passportFacebook from 'passport-facebook';
import passportGoogle from 'passport-google-oauth';
import { BAD_REQUEST, NOT_FOUND, OK } from '../../../utils/constants';
import UserProcessor from '../user/user.processor';
import AppSms from '../../../lib/app-sms';
const FacebookStrategy = passportFacebook.Strategy;
const GoogleStrategy = passportGoogle.OAuth2Strategy;

import AppError from '../../../lib/api/app-error';
import { addHourToDate, generateOTCode, sendMail } from '../../../utils/helpers';

const AuthController = {
    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async authenticate(req, res, next) {
        let session = null;
        try {
            session = await mongoose.startSession();
            await session.startTransaction();
            const obj = req.body;
            const validator = await AuthValidation.signUp(obj);
            if (!validator.passed) {
                return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
            }
            let checkEmail = await Auth.findOne({ email: obj.email });
            const verifyError = await AuthProcessor.canVerify(checkEmail, obj);
            if (verifyError instanceof AppError) {
                return next(verifyError);
            }
            // add verification code to object
            const authObject = await AuthProcessor.processNewObject(obj);
            let auth = new Auth(authObject);
            await auth.save();
            _.extend(obj, { user: auth._id, session });
            const user = await AuthProcessor.processProfileUpdate(obj);
            const token = await AuthProcessor.signToken({ auth, user });
            const response = await AuthProcessor.getResponse({
                token,
                model: Auth,
                code: OK,
                value: _.pick(auth, ['_id', 'email', 'active', 'accountVerified']),
            });
            /*let message = lang.get('email').welcome;
            // send welcome email
            let emailError = await sendMail({
                user: 'user',
                message,
                email: obj.email,
                subject: lang.get('email').welcome_subject,
                filename: 'customer-welcome',
            });
            if (emailError && typeof emailError === 'object') {
            	return next(emailError);
            }*/
            await session.commitTransaction();
            return res.status(OK).json(response);
        } catch (e) {
            await session.abortTransaction();
            return next(e);
        }
    },
    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async signIn(req, res, next) {
        let session = null;
        try {
            session = await mongoose.startSession();
            await session.startTransaction();
            const obj = req.body;
            const validator = await AuthValidation.signIn(obj);
            if (!validator.passed) {
                return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
            }
            const auth = await Auth.findOne({ email: obj.email }).select('+password');
            const canLogin = await AuthProcessor.canLogin(auth, obj);
            if (canLogin instanceof AppError) {
                return next(canLogin);
            }
            _.extend(obj, { user: auth._id, session });
            const user = await AuthProcessor.processProfileUpdate(obj);
            const token = await AuthProcessor.signToken({ auth, user });
            const response = await AuthProcessor.getResponse({
                token,
                model: Auth,
                code: OK,
                value: auth,
            });
            await session.commitTransaction();
            return res.status(OK).json(response);
        } catch (e) {
            await session.abortTransaction();
            return next(e);
        }
    },
    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async resendEmail(req, res, next) {
        try {
            const obj = req.body;
            const validator = await AuthValidation.resendEmail(obj);
            if (!validator.passed) {
                return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
            }
            let auth = await Auth.findOne({ email: obj.email }).select('+password').exec();
            if (!auth) {
                return next(new AppError(lang.get('auth').account_does_not_exist, NOT_FOUND));
            }
            let message = `Your Verification Code is: ${auth.verificationCode}`;
            let emailError = await sendMail({
                user: 'user',
                email: obj.email,
                message,
                subject: lang.get('email').welcome_subject,
                filename: 'customer-resend-mail',
            });
            if (emailError && typeof emailError === 'object') {
            	return next(emailError);
            }
            const response = await AuthProcessor.getResponse({
                model: Auth,
                code: OK,
                value: { email: auth.email }
            });
            return res.status(OK).json(response);
        } catch (e) {
            return next(e);
        }
    },
    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async verifyEmailCode(req, res, next) {
        try {
            const obj = req.body;
            const validator = await AuthValidation.verifyEmailCode(obj);
            if (!validator.passed) {
                return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
            }
            let auth = await Auth.findOne({ email: obj.email }).select('+password').exec();
            const verifyError = await AuthProcessor.cannotVerifyEmail(auth, obj);
            if (verifyError instanceof AppError) {
                return next(verifyError);
            }
            auth = await AuthProcessor.updateEmailVerification(auth, obj);
            const response = await AuthProcessor.getResponse({
                model: Auth,
                code: OK,
                value: { email: auth.email, verified: auth.accountVerified }
            });
            return res.status(OK).json(response);
        } catch (e) {
            return next(e);
        }
    },
    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async sendResetCode(req, res, next) {
        try {
            const obj = req.body;
            const validator = await AuthValidation.sendResetCode(obj);
            if (!validator.passed) {
                return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
            }
            let auth = await Auth.findOne({ email: obj.email }).select('+password').exec();
            if (!auth) {
                return next(new AppError(lang.get('auth').account_does_not_exist, NOT_FOUND));
            }
            auth.passwordResetCode = generateOTCode(4);
            auth.resetCodeExpiration = addHourToDate(24);
            auth = await auth.save();
            let message = `Your Reset Code is: ${auth.passwordResetCode}`;
            let emailError = await sendMail({
                user: 'user',
                message,
                type: 'password',
                email: obj.email,
                subject: lang.get('email').password_reset,
                filename: 'customer-password-reset',
            });
            if (emailError && typeof emailError === 'object') {
            	return next(emailError);
            }
            const response = await AuthProcessor.getResponse({
                model: Auth,
                code: OK,
                value: { mobile: auth.mobile }
            });
            return res.status(OK).json(response);
        } catch (e) {
            return next(e);
        }
    },
    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async resetPassword(req, res, next) {
        try {
            const obj = req.body;
            const { password } = obj;
            const validator = await AuthValidation.resetPassword(obj);
            if (!validator.passed) {
                return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
            }
            let auth = await Auth.findOne({ email: obj.email });
            const resetError = await AuthProcessor.cannotResetPassword(auth, obj);
            if (resetError) {
                return next(resetError);
            }
            auth = await AuthProcessor.resetUserPassword(auth, obj);
            const response = await AuthProcessor.getResponse({
                model: Auth,
                code: OK,
                value: { success: (!!auth), email: auth.email }
            });
            return res.status(OK).json(response);
        } catch (e) {
            return next(e);
        }
    },
    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {Object} res The response object
     */
    facebookLogin() {
        passport.use(new FacebookStrategy(
            config.get('social.facebook'),
            async function(accessToken, refreshToken, profile, done) {
                let user;
                let auth;
                try {
                    let authObj = _.extend({}, { auth: Auth, profile });
                    auth = await AuthProcessor.fbLogin(authObj);
                    const userData = UserProcessor.extractFbData(profile);
                    user = await UserProcessor.fbLogin(auth._id, userData);
                } catch (e) {
                    return done(e);
                }
                return done(null, auth);
            }
        ));
        passport.serializeUser(function(user, done) {
            done(null, user);
        });

        passport.deserializeUser(function(user, done) {
            done(null, user);
        });
        return passport;
    },
    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {Object} res The response object
     */
    googleLogin() {
        passport.use(new GoogleStrategy(
            config.get('social.google'),
            async function(accessToken, refreshToken, profile, done) {
                let user;
                let auth;
                try {
                    let authObj = _.extend({}, { auth: Auth, profile });
                    auth = await AuthProcessor.googleLogin(authObj);
                    const userData = UserProcessor.extractFbData(profile);
                    // user = await UserProcessor.fbLogin(auth._id, userData);
                } catch (e) {
                    return done(e);
                }
                return done(null, auth);
            }
        ));
        passport.serializeUser(function(user, done) {
            done(null, user);
        });

        passport.deserializeUser(function(user, done) {
            done(null, user);
        });
        return passport;
    }

};

export default AuthController;
