import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'Admin' | 'Member';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  role: UserRole;
  jobTitle?: string;
  department?: string;
  bio?: string;
  skills: string[];
  timezone: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['Admin', 'Member'], default: 'Member' },
    jobTitle: { type: String, default: 'Team Member' },
    department: { type: String, default: 'Engineering' },
    bio: { type: String, default: '' },
    skills: [{ type: String }],
    timezone: { type: String, default: 'UTC' },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
