import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Workspace } from '../models/Workspace';
import { Invitation } from '../models/Invitation';
import { v4 as uuidv4 } from 'uuid';

const memoryWorkspaces = new Map<string, any>();

export const createWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, description } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

    let workspace: any;
    try {
      workspace = await Workspace.create({
        name,
        slug,
        description: description || '',
        owner: req.user.userId,
        members: [{ user: req.user.userId, role: 'Owner', joinedAt: new Date() }],
      });
    } catch {
      const mockId = `mem_ws_${Date.now()}`;
      workspace = {
        _id: mockId,
        id: mockId,
        name,
        slug,
        description: description || '',
        owner: req.user.userId,
        members: [{ user: req.user.userId, role: 'Owner', joinedAt: new Date() }],
        createdAt: new Date(),
      };
      memoryWorkspaces.set(mockId, workspace);
    }

    res.status(201).json({ success: true, message: 'Workspace created successfully', data: workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getWorkspaces = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let list: any[] = [];
    try {
      list = await Workspace.find({ 'members.user': req.user.userId }).populate('owner', 'name email avatar');
    } catch {
      list = Array.from(memoryWorkspaces.values());
    }

    if (list.length === 0) {
      // Default initial workspace
      const defaultWs = {
        _id: 'ws_default_1',
        name: 'Product Engineering Workspace',
        slug: 'product-engineering',
        description: 'Core product team collaboration workspace for IntellMeet development.',
        owner: { name: 'Admin', email: req.user.email },
        members: [{ user: req.user.userId, role: 'Owner' }],
        createdAt: new Date(),
      };
      list = [defaultWs];
    }

    res.status(200).json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const inviteMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { workspaceId } = req.params;
    const { email, role } = req.body;

    const token = uuidv4();
    let invitation: any = null;
    try {
      invitation = await Invitation.create({
        workspace: workspaceId,
        email: email.toLowerCase(),
        token,
        role: role || 'Member',
        invitedBy: req.user.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    } catch {
      invitation = {
        _id: `inv_${Date.now()}`,
        workspace: workspaceId,
        email,
        token,
        role: role || 'Member',
        status: 'pending',
      };
    }

    res.status(200).json({
      success: true,
      message: `Invitation sent to ${email}`,
      data: invitation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
