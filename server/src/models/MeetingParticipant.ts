import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingParticipant extends Document {
  meeting: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  displayName: string;
  role: 'host' | 'co-host' | 'participant';
  joinedAt: Date;
  leftAt?: Date;
  isMuted: boolean;
  isVideoOff: boolean;
}

const MeetingParticipantSchema = new Schema<IMeetingParticipant>(
  {
    meeting: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    displayName: { type: String, required: true },
    role: { type: String, enum: ['host', 'co-host', 'participant'], default: 'participant' },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
    isMuted: { type: Boolean, default: false },
    isVideoOff: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const MeetingParticipant = mongoose.model<IMeetingParticipant>('MeetingParticipant', MeetingParticipantSchema);
