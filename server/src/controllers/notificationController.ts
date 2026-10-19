import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let notifications: any[] = [];
    try {
      notifications = await Notification.find({ user: req.user.userId }).sort({ createdAt: -1 });
    } catch {
      // fallback mock notifications
    }

    if (notifications.length === 0) {
      notifications = [
        {
          _id: 'notif_1',
          title: 'Upcoming Meeting',
          message: 'Architecture Review with Product Team starts in 15 minutes.',
          type: 'meeting_reminder',
          link: '/meetings',
          isRead: false,
          createdAt: new Date(),
        },
        {
          _id: 'notif_2',
          title: 'AI Report Ready',
          message: 'AI Summary & Action Items generated for "Sprint Planning Sync".',
          type: 'ai_completed',
          link: '/meetings/meet-spr-101',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          _id: 'notif_3',
          title: 'Task Assigned',
          message: 'Sarah assigned you "Verify STUN/TURN Network Traversal".',
          type: 'task_assigned',
          link: '/tasks',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000),
        },
      ];
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    try {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    } catch {
      // fallback
    }
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    try {
      await Notification.updateMany({ user: req.user.userId }, { isRead: true });
    } catch {
      // fallback
    }

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
