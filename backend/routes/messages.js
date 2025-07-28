import { Router } from 'express';
import { sendMessage, getMessages, getConversations } from '../controllers/messageController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.post('/', auth, sendMessage);
router.get('/conversations', auth, getConversations);
router.get('/:userId', auth, getMessages);

export default router; 