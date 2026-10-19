import mongoose, { Schema, Document } from 'mongoose';
import { WorkspaceRole } from './Workspace';

export interface IInvitation extends Document {
  workspace: mongoose.Types.ObjectId;
  email: string;
  token: string;
  role: WorkspaceRole;
  invitedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    token: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ['Owner', 'Admin', 'Member'], default: 'Member' },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Invitation = mongoose.model<IInvitation>('Invitation', InvitationSchema);
