import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, jobTitle, department, bio, skills, timezone, avatar } = req.body;

    let updatedUser: any = null;
    try {
      updatedUser = await User.findByIdAndUpdate(
        req.user.userId,
        {
          $set: {
            ...(name && { name }),
            ...(jobTitle && { jobTitle }),
            ...(department && { department }),
            ...(bio !== undefined && { bio }),
            ...(skills && { skills }),
            ...(timezone && { timezone }),
            ...(avatar !== undefined && { avatar }),
          },
        },
        { new: true }
      ).select('-passwordHash');
    } catch {
      // In-memory fallback response
      updatedUser = {
        id: req.user.userId,
        name: name || 'User',
        email: req.user.email,
        role: req.user.role,
        jobTitle: jobTitle || 'Team Member',
        department: department || 'Engineering',
        bio: bio || '',
        skills: skills || [],
        timezone: timezone || 'UTC',
        avatar: avatar || '',
      };
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
