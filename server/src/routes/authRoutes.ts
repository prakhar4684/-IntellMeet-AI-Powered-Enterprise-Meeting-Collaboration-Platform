import { Router } from 'express';
import { signup, login, refresh, logout, getMe } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { signupSchema, loginSchema, refreshTokenSchema } from '../validators/authValidators';

const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refresh);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
