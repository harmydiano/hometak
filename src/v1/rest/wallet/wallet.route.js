import { Router } from 'express';
import Wallet from './wallet.model';
import response from '../../../middleware/response';
import auth from '../../middleware/auth';
import WalletController from './wallet.controller';

const router = Router();

const walletCtrl = new WalletController(Wallet);

router.route('/wallet')
	.get(auth, walletCtrl.id, response);

export default router;
