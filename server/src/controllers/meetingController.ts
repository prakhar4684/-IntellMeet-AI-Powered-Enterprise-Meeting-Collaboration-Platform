import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Meeting } from '../models/Meeting';
import { generateAiMeetingReport } from '../services/aiService';
import { v4 as uuidv4 } from 'uuid';

const memoryMeetings = new Map<string, any>();

export const createMeeting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      title,
      description,
      startTime,
      durationMinutes,
      workspaceId,
      isRecordingEnabled,
      isAiEnabled,
      invitees,
    } = req.body;

    const rawCode = uuidv4().substring(0, 8);
    const meetingCode = `meet-${rawCode.slice(0, 3)}-${rawCode.slice(3, 7)}`;

    let meeting: any;
    try {
      meeting = await Meeting.create({
        title,
        description: description || '',
        organizer: req.user.userId,
        workspace: workspaceId || undefined,
        meetingCode,
        startTime: new Date(startTime),
        durationMinutes: durationMinutes || 30,
        status: 'scheduled',
        isRecordingEnabled: isRecordingEnabled !== undefined ? isRecordingEnabled : true,
        isAiEnabled: isAiEnabled !== undefined ? isAiEnabled : true,
        invitees: invitees || [],
      });
    } catch {
      const mockId = `mem_meet_${Date.now()}`;
      meeting = {
        _id: mockId,
        id: mockId,
        title,
        description: description || '',
        organizer: req.user.userId,
        workspace: workspaceId || null,
        meetingCode,
        startTime: new Date(startTime),
        durationMinutes: durationMinutes || 30,
        status: 'scheduled',
        isRecordingEnabled: isRecordingEnabled !== undefined ? isRecordingEnabled : true,
        isAiEnabled: isAiEnabled !== undefined ? isAiEnabled : true,
        invitees: invitees || [],
        createdAt: new Date(),
      };
      memoryMeetings.set(meetingCode, meeting);
      memoryMeetings.set(mockId, meeting);
    }

    res.status(201).json({
      success: true,
      message: 'Meeting created successfully',
      data: meeting,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getMeetings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { status, workspaceId } = req.query;

    let meetings: any[] = [];
    try {
      const filter: any = {
        $or: [{ organizer: req.user.userId }, { invitees: req.user.email }],
      };
      if (status) filter.status = status;
      if (workspaceId) filter.workspace = workspaceId;

      meetings = await Meeting.find(filter)
        .populate('organizer', 'name email avatar jobTitle')
        .sort({ startTime: 1 });
    } catch {
      meetings = Array.from(memoryMeetings.values()).filter((m) => {
        if (m.organizer !== req.user?.userId && !m.invitees?.includes(req.user?.email)) return false;
        if (status && m.status !== status) return false;
        return true;
      });
    }

    res.status(200).json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getMeetingByCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const code = req.params.code as string;

    let meeting: any = null;
    try {
      meeting = await Meeting.findOne({ meetingCode: code }).populate('organizer', 'name email avatar jobTitle');
    } catch {
      meeting = memoryMeetings.get(code) || null;
    }

    if (!meeting) {
      res.status(404).json({ success: false, message: 'Meeting not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const endMeeting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const code = req.params.code as string;

    let meeting: any = null;
    try {
      meeting = await Meeting.findOneAndUpdate(
        { meetingCode: code },
        { status: 'completed' },
        { new: true }
      );
    } catch {
      meeting = memoryMeetings.get(code);
      if (meeting) {
        meeting.status = 'completed';
      }
    }

    if (!meeting) {
      res.status(404).json({ success: false, message: 'Meeting not found' });
      return;
    }

    // Trigger post-meeting AI intelligence processing asynchronously!
    generateAiMeetingReport(meeting._id ? meeting._id.toString() : meeting.id, meeting.title).catch((err) =>
      console.warn('[AI Processing Error]', err)
    );

    res.status(200).json({
      success: true,
      message: 'Meeting ended and AI analysis queued successfully',
      data: meeting,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const deleteMeeting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    try {
      await Meeting.findByIdAndDelete(id);
    } catch {
      memoryMeetings.delete(id);
    }

    res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
