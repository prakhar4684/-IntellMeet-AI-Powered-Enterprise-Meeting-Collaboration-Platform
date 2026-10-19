import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingMessage extends Document {
  meeting: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  senderName: string;
  text: string;
  createdAt: Date;
}

const MeetingMessageSchema = new Schema<IMeetingMessage>(
  {
    meeting: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export const MeetingMessage = mongoose.model<IMeetingMessage>('MeetingMessage', MeetingMessageSchema);
