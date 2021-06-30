import bcrypt from 'bcrypt-nodejs';
import mongoose, { Schema } from 'mongoose';
import { decrypt, encrypt } from '../../../utils/helpers';
import config from 'config';

/**
 * Auth Schema
 */
const AuthModel = new Schema({
	email: {
		required: true,
		type: String,
		unique: true,
		index: true
	},
	facebookId: {
		type: String,
	},
	googleId: {
		type: String,
	},
	password: {
		type: String,
		select: true,
	},
	accountVerified: {
		type: Boolean,
		default: false,
	},
	role: {
		type: String,
	},
	verificationCode: {
		type: String,
		get: (e) => (config.get('auth.email_encryption') === true) ? decrypt(e) : e,
		set: (e) => (config.get('auth.email_encryption') === true) ? encrypt(e) : e,
	},
	passwordResetCode: {
		type: String,
		get: (e) => (config.get('auth.email_encryption') === true) ? decrypt(e) : e,
		set: (e) => (config.get('auth.email_encryption') === true) ? encrypt(e) : e,
	},
	active: {
		type: Boolean,
		default: false,
	},
	passwordReset: {
		type: Boolean,
		default: false,
	},
	c: {
		type: String,
		get: (e) => (config.get('auth.email_encryption') === true) ? decrypt(e) : e,
		set: (e) => (config.get('auth.email_encryption') === true) ? encrypt(e) : e,
	},
	resetCodeExpiration: {
		type: Date,
	},
	verifyCodeExpiration: {
		type: Date,
	},
	changedPassword: {
		type: Boolean,
		default: false,
	},
	deleted: {
		type: Boolean,
		default: false,
		select: false,
	},
}, {
	autoCreate: true,
	timestamps: true
});

AuthModel.statics.fillables = ['email'];

if (config.app.environment === 'production') {
	AuthModel.statics.hiddenFields = ['password', 'verificationCode', 'passwordResetCode'];
}

AuthModel.pre('save', function(next) {
	const user = this;
	if (!user.isModified('password')) return next();
	user.password = bcrypt.hashSync(user.password);
	next();
});

/**
 * @param {String} password The password to compare against
 * @return {Boolean} The result of the comparison
 */
AuthModel.methods.comparePassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

/**
 * @param {String} token The password to compare against
 * @return {Boolean} The result of the comparison
 */
AuthModel.methods.compareVerificationToken = function(token) {
	return bcrypt.compareSync(this.verification_code, token);
};

/**
 * @param {String} token The password to compare against
 * @return {Boolean} The result of the comparison
 */
AuthModel.methods.compareResetPasswordToken = function(token) {
	return bcrypt.compareSync(this.password_reset_code, token);
};

/**
 * @typedef AuthModel
 */
const Auth = mongoose.models.Auth || mongoose.model('Auth', AuthModel);
export default Auth;
