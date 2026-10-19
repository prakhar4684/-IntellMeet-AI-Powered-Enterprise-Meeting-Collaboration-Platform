import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'meeting_invitation'
  | 'meeting_reminder'
  | 'meeting_started'
  | 'task_assigned'
  | 'task_due'
  | 'comment_mention'
  | 'ai_completed';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'meeting_invitation',
        'meeting_reminder',
        'meeting_started',
        'task_assigned',
        'task_due',
        'comment_mention',
        'ai_completed',
      ],
      required: true,
    },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
