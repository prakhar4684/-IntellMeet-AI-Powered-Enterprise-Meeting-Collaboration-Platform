import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingSummary extends Document {
  meeting: mongoose.Types.ObjectId;
  overview: string;
  mainPoints: string[];
  decisions: string[];
  questions: string[];
  outcomes: string[];
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSummarySchema = new Schema<IMeetingSummary>(
  {
    meeting: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true, unique: true, index: true },
    overview: { type: String, required: true },
    mainPoints: [{ type: String }],
    decisions: [{ type: String }],
    questions: [{ type: String }],
    outcomes: [{ type: String }],
    recommendations: [{ type: String }],
  },
  { timestamps: true }
);

export const MeetingSummary = mongoose.model<IMeetingSummary>('MeetingSummary', MeetingSummarySchema);
