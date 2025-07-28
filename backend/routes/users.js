import { Router } from 'express';
import { getMe, updateMe, getUser, changePassword } from '../controllers/userController.js';
import auth from '../middleware/auth.js';
import { uploadAvatar } from '../utils/upload.js';

const router = Router();

router.get('/me', auth, getMe);
router.put('/me', auth, uploadAvatar, updateMe);
router.put('/me/password', auth, changePassword);
router.get('/:id', getUser);

export default router; 