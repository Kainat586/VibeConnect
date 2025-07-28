import { Router } from 'express';
import { signup, login } from '../controllers/authController.js';

const router = Router();

router.post('/signup', signup);
router.post('/signin', login);

export default router; 