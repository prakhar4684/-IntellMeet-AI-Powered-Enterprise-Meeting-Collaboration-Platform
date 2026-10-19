import { Router } from 'express';
import { createWorkspace, getWorkspaces, inviteMember } from '../controllers/workspaceController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createWorkspace);
router.get('/', getWorkspaces);
router.post('/:workspaceId/invite', inviteMember);

export default router;
