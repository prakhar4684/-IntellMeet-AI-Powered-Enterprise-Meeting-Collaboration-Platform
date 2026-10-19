import { Router } from 'express';
import { updateProfile } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema } from '../validators/authValidators';

const router = Router();

router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);

export default router;
