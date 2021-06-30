import { Router } from 'express';
import config from 'config';
import auth from '../../middleware/auth';
import resource from '../../middleware/resource';
import response from '../../../middleware/response';
import ResourceController from './resource.controller';

const router = Router();
const resourceCtrl = new ResourceController();
const regex = config.get('api.resource');

router.get('/resources/all', resourceCtrl.all, response);
router.get('/resources/list', resourceCtrl.list, response);
router.use(resource);
router.param('id', resourceCtrl.id);

router.put(`${regex}/:id([a-zA-Z0-9]+)/status/:status`, resourceCtrl.status, response);
router.route(regex)
	.post(auth, resourceCtrl.create, response)
	.get(auth, resourceCtrl.find, response);
router.route(`${regex}/:id([a-zA-Z0-9]+)`)
	.get(resourceCtrl.findOne, response)
	.put(auth, resourceCtrl.update, response)
	.delete(auth, resourceCtrl.delete, response);
export default router;
