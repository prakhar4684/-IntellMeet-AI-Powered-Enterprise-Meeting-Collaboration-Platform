import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskComment extends Document {
  task: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const TaskCommentSchema = new Schema<ITaskComment>(
  {
    task: { type: Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const TaskComment = mongoose.model<ITaskComment>('TaskComment', TaskCommentSchema);
