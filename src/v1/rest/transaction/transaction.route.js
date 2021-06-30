import { Router } from 'express';
import Transaction from './transaction.model';
import response from '../../../middleware/response';
import auth from '../../middleware/auth';
import TransactionController from './transaction.controller';

const router = Router();

const transactionCtrl = new TransactionController(Transaction);

router.route('/fund')
	.post(auth, transactionCtrl.create, response);
router.route('/charge')
	.post(auth, transactionCtrl.charge, response);
router.route('/transfer')
	.post(auth, transactionCtrl.transfer, response);
router.route('/store')
	.post(auth, transactionCtrl.store, response);
router.route('/transactions')
	.get(auth, transactionCtrl.find, response);
router.route('/user/transactions')
	.get(auth, transactionCtrl.merchant, response);

export default router;
