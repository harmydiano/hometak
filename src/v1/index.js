import { Router } from 'express';

import auth from './rest/auth/auth.route';
import social from './rest/social/auth.route';
import user from './rest/user/user.route';
import merchant from './rest/merchant/merchant.route';
import plan from './rest/plan/plan.route';
import booking from './rest/booking/booking.route';
import cleaners from './rest/cleaners/cleaners.route';
import staff from './rest/staff/staff.route';
import resources from './rest/resource/resource.route';
import media from './rest/media/media.route';
import wallet from './rest/wallet/wallet.route';
import transaction from './rest/transaction/transaction.route';

const router = Router();

router.use(auth);
router.use(social);
router.use(user);
router.use(merchant);
router.use(plan);
router.use(booking);
router.use(cleaners);
router.use(staff);
router.use(wallet);
router.use(resources);
router.use(media);
router.use(transaction);

export default router;
