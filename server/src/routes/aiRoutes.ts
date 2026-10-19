import { Router } from 'express';
import {
  getTranscript,
  getSummary,
  getActionItems,
  queryAiAssistant,
  triggerAiReport,
} from '../controllers/aiController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/transcript/:meetingId', getTranscript);
router.get('/summary/:meetingId', getSummary);
router.get('/action-items/:meetingId', getActionItems);
router.post('/query/:meetingId', queryAiAssistant);
router.post('/generate-report/:meetingId', triggerAiReport);

export default router;
