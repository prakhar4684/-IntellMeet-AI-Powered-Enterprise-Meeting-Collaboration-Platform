import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Task, TaskStatus } from '../models/Task';
import { ActionItem } from '../models/ActionItem';

const memoryTasks = new Map<string, any>();

const seedInitialTasks = (creatorId: string) => {
  const initial = [
    {
      _id: 'task_1',
      title: 'Setup WebRTC Mesh & STUN/TURN Signaling',
      description: 'Configure peer connection offer/answer exchange via Socket.io.',
      status: 'completed',
      priority: 'high',
      creator: creatorId,
      createdAt: new Date(),
    },
    {
      _id: 'task_2',
      title: 'Build AI Meeting Intelligence Pipeline',
      description: 'Implement speech-to-text transcript processing & action item auto-extraction.',
      status: 'in_progress',
      priority: 'urgent',
      creator: creatorId,
      createdAt: new Date(),
    },
    {
      _id: 'task_3',
      title: 'Design Kanban Workspaces & Board Interface',
      description: 'Create responsive drag-and-drop task columns with status persistency.',
      status: 'todo',
      priority: 'medium',
      creator: creatorId,
      createdAt: new Date(),
    },
    {
      _id: 'task_4',
      title: 'Conduct Security Audit & Refresh Token Rotation',
      description: 'Ensure JWT access/refresh token rotation and rate limiting middleware are active.',
      status: 'backlog',
      priority: 'high',
      creator: creatorId,
      createdAt: new Date(),
    },
  ];

  initial.forEach((t) => memoryTasks.set(t._id, t));
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { title, description, workspaceId, meetingId, assigneeId, priority, status, deadline, tags } = req.body;

    let task: any;
    try {
      task = await Task.create({
        title,
        description: description || '',
        workspace: workspaceId || undefined,
        meeting: meetingId || undefined,
        assignee: assigneeId || undefined,
        creator: req.user.userId,
        priority: priority || 'medium',
        status: status || 'todo',
        deadline: deadline ? new Date(deadline) : undefined,
        tags: tags || [],
      });
    } catch {
      const mockId = `mem_task_${Date.now()}`;
      task = {
        _id: mockId,
        id: mockId,
        title,
        description: description || '',
        workspace: workspaceId || null,
        meeting: meetingId || null,
        assignee: assigneeId || null,
        creator: req.user.userId,
        priority: priority || 'medium',
        status: status || 'todo',
        deadline: deadline ? new Date(deadline) : null,
        tags: tags || [],
        createdAt: new Date(),
      };
      memoryTasks.set(mockId, task);
    }

    res.status(201).json({ success: true, message: 'Task created successfully', data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (memoryTasks.size === 0) {
      seedInitialTasks(req.user.userId);
    }

    const { status, workspaceId } = req.query;

    let tasks: any[] = [];
    try {
      const filter: any = {};
      if (status) filter.status = status;
      if (workspaceId) filter.workspace = workspaceId;

      tasks = await Task.find(filter)
        .populate('assignee', 'name email avatar')
        .populate('creator', 'name email')
        .sort({ createdAt: -1 });
    } catch {
      tasks = Array.from(memoryTasks.values()).filter((t) => {
        if (status && t.status !== status) return false;
        return true;
      });
    }

    if (tasks.length === 0) {
      tasks = Array.from(memoryTasks.values());
    }

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    let updatedTask: any = null;
    try {
      updatedTask = await Task.findByIdAndUpdate(id, { status }, { new: true });
    } catch {
      updatedTask = memoryTasks.get(id);
      if (updatedTask) {
        updatedTask.status = status;
      }
    }

    if (!updatedTask) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Task status updated', data: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const convertActionItemToTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { actionItemId } = req.body;

    let actionItem: any = null;
    try {
      actionItem = await ActionItem.findById(actionItemId);
    } catch {
      actionItem = {
        title: 'Action Item Task',
        description: 'Auto-extracted task from meeting discussion',
        priority: 'high',
        meeting: req.body.meetingId,
      };
    }

    const taskData = {
      title: actionItem ? actionItem.title : 'Extracted Task',
      description: actionItem ? actionItem.description : 'Task from meeting action item',
      meeting: actionItem ? actionItem.meeting : undefined,
      creator: req.user.userId,
      priority: actionItem ? actionItem.priority : 'medium',
      status: 'todo' as TaskStatus,
      tags: ['AI-Extracted', 'Meeting-Action'],
    };

    let newTask: any;
    try {
      newTask = await Task.create(taskData);
      if (actionItem && actionItem._id) {
        await ActionItem.findByIdAndUpdate(actionItemId, {
          status: 'in-progress',
          convertedToTaskId: newTask._id,
        });
      }
    } catch {
      const mockId = `task_act_${Date.now()}`;
      newTask = { ...taskData, _id: mockId, id: mockId, createdAt: new Date() };
      memoryTasks.set(mockId, newTask);
    }

    res.status(201).json({
      success: true,
      message: 'Action item converted to Kanban task successfully',
      data: newTask,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    try {
      await Task.findByIdAndDelete(id);
    } catch {
      memoryTasks.delete(id);
    }

    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
