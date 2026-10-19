import { Router } from 'express';
import {
  createMeeting,
  getMeetings,
  getMeetingByCode,
  endMeeting,
  deleteMeeting,
} from '../controllers/meetingController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createMeetingSchema } from '../validators/meetingValidators';

const router = Router();

router.use(authenticate);

router.post('/', validate(createMeetingSchema), createMeeting);
router.get('/', getMeetings);
router.get('/code/:code', getMeetingByCode);
router.post('/code/:code/end', endMeeting);
router.delete('/:id', deleteMeeting);

export default router;
