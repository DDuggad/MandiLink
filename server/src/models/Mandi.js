import mongoose from 'mongoose';

const mandiSchema = new mongoose.Schema(
  {
    code: { type: String, trim: true, index: true },
    names: {
      en: { type: String, required: true, trim: true },
      kn: { type: String, required: true, trim: true },
      hi: { type: String, required: true, trim: true },
      mr: { type: String, required: true, trim: true },
    },
    state: { type: String, required: true, trim: true, index: true },
    district: { type: String, required: true, trim: true, index: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for nearby mandis geo queries
mandiSchema.index({ location: '2dsphere' });
mandiSchema.index({ state: 1, district: 1 });

export const Mandi = mongoose.model('Mandi', mandiSchema);
