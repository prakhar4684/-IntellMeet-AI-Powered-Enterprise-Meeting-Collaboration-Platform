import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

// In-memory fallback user store when MongoDB is unavailable
const memoryUsers = new Map<string, IUser>();
const memoryRefreshTokens = new Set<string>();

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, jobTitle, department, timezone } = req.body;

    let existingUser = null;
    try {
      existingUser = await User.findOne({ email: email.toLowerCase() });
    } catch {
      existingUser = memoryUsers.get(email.toLowerCase()) || null;
    }

    if (existingUser) {
      res.status(400).json({ success: false, message: 'User with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let user: any;
    try {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        jobTitle: jobTitle || 'Software Engineer',
        department: department || 'Engineering',
        timezone: timezone || 'UTC',
        skills: ['JavaScript', 'React', 'Node.js'],
        role: 'Member',
      });
    } catch {
      // In-memory fallback
      const mockId = `mem_${Date.now()}`;
      user = {
        _id: mockId,
        id: mockId,
        name,
        email: email.toLowerCase(),
        passwordHash,
        jobTitle: jobTitle || 'Software Engineer',
        department: department || 'Engineering',
        timezone: timezone || 'UTC',
        skills: ['JavaScript', 'React', 'Node.js'],
        role: 'Member',
        createdAt: new Date(),
      };
      memoryUsers.set(email.toLowerCase(), user as any);
    }

    const payload = { userId: user._id.toString(), role: user.role, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    try {
      await RefreshToken.create({
        user: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    } catch {
      memoryRefreshTokens.add(refreshToken);
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          jobTitle: user.jobTitle,
          department: user.department,
          avatar: user.avatar || '',
        },
        tokens: { accessToken, refreshToken },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    let user: any = null;
    try {
      user = await User.findOne({ email: email.toLowerCase() });
    } catch {
      user = memoryUsers.get(email.toLowerCase()) || null;
    }

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const payload = { userId: user._id.toString(), role: user.role, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    try {
      await RefreshToken.create({
        user: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    } catch {
      memoryRefreshTokens.add(refreshToken);
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          jobTitle: user.jobTitle,
          department: user.department,
          avatar: user.avatar || '',
          bio: user.bio || '',
          skills: user.skills || [],
          timezone: user.timezone || 'UTC',
        },
        tokens: { accessToken, refreshToken },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
      return;
    }

    try {
      const storedToken = await RefreshToken.findOne({ token: refreshToken, isRevoked: false });
      if (!storedToken) {
        res.status(401).json({ success: false, message: 'Refresh token revoked or missing' });
        return;
      }
      storedToken.isRevoked = true;
      await storedToken.save();
    } catch {
      if (!memoryRefreshTokens.has(refreshToken)) {
        res.status(401).json({ success: false, message: 'Refresh token revoked' });
        return;
      }
      memoryRefreshTokens.delete(refreshToken);
    }

    const newPayload = { userId: payload.userId, role: payload.role, email: payload.email };
    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    try {
      await RefreshToken.create({
        user: payload.userId,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    } catch {
      memoryRefreshTokens.add(newRefreshToken);
    }

    res.status(200).json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let user: any = null;
    try {
      user = await User.findById(req.user.userId).select('-passwordHash');
    } catch {
      for (const u of memoryUsers.values()) {
        if (u.id === req.user.userId || (u as any)._id === req.user.userId) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      // Return payload-based fallback if user record is transient
      user = {
        id: req.user.userId,
        name: req.user.email.split('@')[0],
        email: req.user.email,
        role: req.user.role,
        jobTitle: 'Senior Software Engineer',
        department: 'Engineering',
        skills: ['React', 'TypeScript', 'Node.js', 'WebRTC'],
        timezone: 'UTC',
      };
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      try {
        await RefreshToken.updateOne({ token: refreshToken }, { isRevoked: true });
      } catch {
        memoryRefreshTokens.delete(refreshToken);
      }
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
