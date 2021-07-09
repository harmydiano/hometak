import { Router } from 'express';
import response from '../../../middleware/response';
import auth from '../../middleware/auth';
import BankController from './bank.controller';

const router = Router();

const bankCtrl = new BankController();

router.route('/banks')
    .post(auth, bankCtrl.list, response);
router.route('/bank/account')
    .post(auth, bankCtrl.account, response);

export default router;
