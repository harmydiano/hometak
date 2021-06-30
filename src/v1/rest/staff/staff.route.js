import { Router } from 'express';
import {Staff} from './staff.model';
import response from '../../../middleware/response';
import auth from '../../middleware/auth';
import StaffController from './staff.controller';

const router = Router();

const staffCtrl = new StaffController(Staff);

router.route('/staff/me')
    .get(auth, staffCtrl.currentUser, response)
    .put(auth, staffCtrl.updateMe, response);

router.route('/staff')
    .post(auth, staffCtrl.create, response)
    .get(auth, staffCtrl.find, response);
router.param('id', staffCtrl.id, response);
router.route('/staff/:id')
    .get(auth, staffCtrl.findOne, response)
    .put(auth, staffCtrl.update, response);

export default router;
