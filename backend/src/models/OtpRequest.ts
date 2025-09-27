import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOtpRequest extends Document {
  email: string;
  ip?: string;
  createdAt: Date;
  expiresAt: Date;
}

const OtpRequestSchema = new Schema<IOtpRequest>({
  email: { type: String, required: true, index: true },
  ip: { type: String },
  // TTL index; we’ll set expiresAt to now + window for different windows as needed
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });

export const OtpRequest: Model<IOtpRequest> = mongoose.models.OtpRequest || mongoose.model<IOtpRequest>('OtpRequest', OtpRequestSchema);
