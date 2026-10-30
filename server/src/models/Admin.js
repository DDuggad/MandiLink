import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Admin = mongoose.model('Admin', adminSchema);
