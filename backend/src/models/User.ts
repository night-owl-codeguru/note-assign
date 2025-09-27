import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  dob: string; // ISO date string
  email: string;
  googleId?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  dob: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  googleId: { type: String },
  verified: { type: Boolean, default: false, index: true },
}, { timestamps: true });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
