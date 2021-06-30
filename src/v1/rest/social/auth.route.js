import { Router } from 'express';
import SocialAuth from './auth.controller';
import AuthProcessor from './auth.processor';

const router = Router();
const fbAuth = SocialAuth.facebook();
const googleAuth = SocialAuth.google();
/* FACEBOOK ROUTER */
router.get('/facebook',
	fbAuth.authenticate('facebook'));

router.get('/facebook/callback',
	fbAuth.authenticate('facebook', { failureRedirect: '/login' }),
	AuthProcessor.processResponse
	// async function(req, res) {
	// Successful authentication, redirect home.
	//  res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user));
	//  res.status(200).cookie('jwt', AuthProcessor.signToken({ auth: req.user }));
	// res.status(200).json({ token: await AuthProcessor.signToken({ auth: req.user }) });
	// }
);

/* FACEBOOK ROUTER */
router.get('/google',
	googleAuth.authenticate('google', {
		scope: [
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email'
		]
	}));

router.get('/google/callback',
	googleAuth.authenticate('google', { failureRedirect: '/login' }),
	AuthProcessor.processResponse
	/* async function(req, res) {
    	// Successful authentication, redirect home.
    	//  res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user));
    	//  res.status(200).cookie('jwt', AuthProcessor.signToken({ auth: req.user }));
    	res.status(200).json({ token: await AuthProcessor.signToken({ auth: req.user }) });
    }*/
);

export default router;
