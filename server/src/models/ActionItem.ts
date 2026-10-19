import mongoose, { Schema, Document } from 'mongoose';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface IActionItem extends Document {
  meeting: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  assigneeName?: string;
  assignee?: mongoose.Types.ObjectId;
  deadline?: Date;
  priority: PriorityLevel;
  status: 'pending' | 'in-progress' | 'completed';
  convertedToTaskId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ActionItemSchema = new Schema<IActionItem>(
  {
    meeting: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    assigneeName: { type: String, default: '' },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    deadline: { type: Date },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    convertedToTaskId: { type: Schema.Types.ObjectId, ref: 'Task' },
  },
  { timestamps: true }
);

export const ActionItem = mongoose.model<IActionItem>('ActionItem', ActionItemSchema);
