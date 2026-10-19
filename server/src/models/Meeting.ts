import mongoose, { Schema, Document } from 'mongoose';

export type MeetingStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface IMeeting extends Document {
  title: string;
  description?: string;
  organizer: mongoose.Types.ObjectId;
  workspace?: mongoose.Types.ObjectId;
  meetingCode: string;
  passwordHash?: string;
  startTime: Date;
  durationMinutes: number;
  status: MeetingStatus;
  isRecordingEnabled: boolean;
  isAiEnabled: boolean;
  invitees: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeeting>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', index: true },
    meetingCode: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, default: '' },
    startTime: { type: Date, required: true },
    durationMinutes: { type: Number, default: 30 },
    status: { type: String, enum: ['scheduled', 'live', 'completed', 'cancelled'], default: 'scheduled' },
    isRecordingEnabled: { type: Boolean, default: true },
    isAiEnabled: { type: Boolean, default: true },
    invitees: [{ type: String }],
  },
  { timestamps: true }
);

export const Meeting = mongoose.model<IMeeting>('Meeting', MeetingSchema);
