import Auth from '../auth/auth.model';
import SocialAuthProcessor from './auth.processor';
import _ from 'lodash';
import config from 'config';
import passport from 'passport';
import passportFacebook from 'passport-facebook';
import passportGoogle from 'passport-google-oauth';
import UserProcessor from '../user/user.processor';
const FacebookStrategy = passportFacebook.Strategy;
const GoogleStrategy = passportGoogle.OAuth2Strategy;


const SocialAuthController = {
	/**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The callback to the next program handler
     * @return {Object} res The response object
     */
	facebook() {
		passport.use(new FacebookStrategy(
			config.get('social.facebook'),
			async function(accessToken, refreshToken, profile, done) {
				let user;
				let auth;
				try {
					let authObj = _.extend({}, { auth: Auth, profile });
					auth = await SocialAuthProcessor.processFbLogin(authObj);
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
	google() {
		passport.use(new GoogleStrategy(
			config.get('social.google'),
			async function(accessToken, refreshToken, profile, done) {
				let user;
				let auth;
				try {
					let authObj = _.extend({}, { auth: Auth, profile });
					auth = await SocialAuthProcessor.processGoogleLogin(authObj);
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
	}

};

export default SocialAuthController;
