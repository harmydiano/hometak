import { Router } from 'express';
import Auth from './auth.controller';

const router = Router();

router.post('/authenticate', Auth.authenticate);
router.post('/signIn', Auth.signIn);
// router.post('/signUp', Auth.signUp);
router.post('/resendEmailCode', Auth.resendEmail);
router.post('/verifyEmailCode', Auth.verifyEmailCode);
router.post('/sendResetCode', Auth.sendResetCode);
router.post('/resetPassword', Auth.resetPassword);
export default router;
