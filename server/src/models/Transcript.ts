import mongoose, { Schema, Document } from 'mongoose';

export interface ITranscriptSegment {
  speakerId?: string;
  speakerName: string;
  text: string;
  startTime: number;
  endTime: number;
}

export interface ITranscript extends Document {
  meeting: mongoose.Types.ObjectId;
  segments: ITranscriptSegment[];
  fullText: string;
  createdAt: Date;
  updatedAt: Date;
}

const TranscriptSchema = new Schema<ITranscript>(
  {
    meeting: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true, unique: true, index: true },
    segments: [
      {
        speakerId: { type: String },
        speakerName: { type: String, required: true },
        text: { type: String, required: true },
        startTime: { type: Number, required: true },
        endTime: { type: Number, required: true },
      },
    ],
    fullText: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Transcript = mongoose.model<ITranscript>('Transcript', TranscriptSchema);
