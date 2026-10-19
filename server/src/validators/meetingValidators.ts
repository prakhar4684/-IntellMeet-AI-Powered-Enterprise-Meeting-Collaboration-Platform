import { z } from 'zod';

export const createMeetingSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  startTime: z.string().or(z.date()),
  durationMinutes: z.number().min(5).default(30),
  workspaceId: z.string().optional(),
  isRecordingEnabled: z.boolean().default(true),
  isAiEnabled: z.boolean().default(true),
  invitees: z.array(z.string()).optional(),
  password: z.string().optional(),
});

export const updateMeetingSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  startTime: z.string().or(z.date()).optional(),
  durationMinutes: z.number().min(5).optional(),
  isRecordingEnabled: z.boolean().optional(),
  isAiEnabled: z.boolean().optional(),
  status: z.enum(['scheduled', 'live', 'completed', 'cancelled']).optional(),
});
