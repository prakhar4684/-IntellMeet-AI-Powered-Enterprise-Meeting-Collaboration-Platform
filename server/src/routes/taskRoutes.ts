import { Router } from 'express';
import {
  createTask,
  getTasks,
  updateTaskStatus,
  convertActionItemToTask,
  deleteTask,
} from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createTask);
router.get('/', getTasks);
router.patch('/:id/status', updateTaskStatus);
router.post('/from-action-item', convertActionItemToTask);
router.delete('/:id', deleteTask);

export default router;
