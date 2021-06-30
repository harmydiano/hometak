import { Router } from 'express';
import MediaController from './media.controller';
import MediaModel from './media.model';
import auth from '../../middleware/auth';
import response from '../../../middleware/response';
import UploadFile from '../../../lib/upload-file';

const router = Router();
const mediaCtrl = new MediaController(MediaModel);
router.post('/media', new UploadFile({
	type: 'file',
	folder: 'file'
}).init(), auth, mediaCtrl.upload, response);
export default router;
