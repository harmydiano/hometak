import { Router } from 'express';
import {Merchant} from './merchant.model';
import Auth from '../auth/auth.model';
import response from '../../../middleware/response';
import auth from '../../middleware/auth';
import MerchantController from './merchant.controller';

const router = Router();

const merchantCtrl = new MerchantController(Merchant);

router.route('/merchants/me')
    .get(auth, merchantCtrl.currentUser, response)
    .put(auth, merchantCtrl.updateMe, response);

router.route('/merchants')
    .get(auth, merchantCtrl.find, response);
router.param('id', merchantCtrl.id, response);
router.route('/merchants/:id')
    .get(auth, merchantCtrl.findOne, response)
    .put(auth, merchantCtrl.update, response);

export default router;
