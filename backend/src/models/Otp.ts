import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  code: string;
  name?: string;
  dob?: string;
  expiresAt: Date;
  attempts?: number;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OtpSchema = new Schema<IOtp>({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  name: { type: String },
  dob: { type: String },
  attempts: { type: Number, default: 0 },
  lockedUntil: { type: Date },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL at the time set
}, { timestamps: true });

export const Otp: Model<IOtp> = mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema);
