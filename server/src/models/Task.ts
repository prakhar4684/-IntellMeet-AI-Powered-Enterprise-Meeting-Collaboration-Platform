import mongoose, { Schema, Document } from 'mongoose';
import { PriorityLevel } from './ActionItem';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'completed';

export interface ITask extends Document {
  workspace?: mongoose.Types.ObjectId;
  meeting?: mongoose.Types.ObjectId;
  actionItem?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  assignee?: mongoose.Types.ObjectId;
  creator: mongoose.Types.ObjectId;
  priority: PriorityLevel;
  status: TaskStatus;
  deadline?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', index: true },
    meeting: { type: Schema.Types.ObjectId, ref: 'Meeting', index: true },
    actionItem: { type: Schema.Types.ObjectId, ref: 'ActionItem' },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    assignee: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: {
      type: String,
      enum: ['backlog', 'todo', 'in_progress', 'review', 'completed'],
      default: 'todo',
      index: true,
    },
    deadline: { type: Date },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export const Task = mongoose.model<ITask>('Task', TaskSchema);
