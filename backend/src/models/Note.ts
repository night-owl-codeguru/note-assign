import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface INote extends Document {
  userId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  content: { type: String, required: true },
}, { timestamps: true });

export const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);
