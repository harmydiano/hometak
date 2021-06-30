import { Router } from 'express';
import {Cleaners} from './cleaners.model';
import response from '../../../middleware/response';
import auth from '../../middleware/auth';
import CleanersController from './cleaners.controller';

const router = Router();

const cleanersCtrl = new CleanersController(Cleaners);

router.route('/cleaners/me')
    .get(auth, cleanersCtrl.currentUser, response)
    .put(auth, cleanersCtrl.updateMe, response);

router.route('/cleaners')
    .post(auth, cleanersCtrl.create, response)
    .get(auth, cleanersCtrl.find, response);
router.param('id', cleanersCtrl.id, response);
router.route('/cleaners/:id')
    .get(auth, cleanersCtrl.findOne, response)
    .put(auth, cleanersCtrl.update, response);

export default router;
