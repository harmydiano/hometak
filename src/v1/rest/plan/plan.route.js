import { Router } from 'express';
import {Plan} from './plan.model';
import response from '../../../middleware/response';
import auth from '../../middleware/auth';
import PlanController from './plan.controller';

const router = Router();

const planCtrl = new PlanController(Plan);

router.route('/plans/me')
    .get(auth, planCtrl.currentUserPlan, response)
router.route('/plans')
    .post(auth, planCtrl.create, response)
    .get(auth, planCtrl.find, response);
router.param('id', planCtrl.id, response);
router.route('/plans/:id')
    .get(auth, planCtrl.findOne, response)
    .put(auth, planCtrl.update, response);

export default router;
