import mongoose from 'mongoose';

const commoditySchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    names: {
      en: { type: String, required: true, trim: true },
      kn: { type: String, required: true, trim: true },
      hi: { type: String, required: true, trim: true },
      mr: { type: String, required: true, trim: true },
    },
    category: {
      type: String,
      enum: [
        'cereal',
        'pulse',
        'oilseed',
        'vegetable',
        'spice',
        'fibre',
        'fruit',
        'other',
      ],
      default: 'vegetable',
      index: true,
    },
    defaultUnit: { type: String, default: 'quintal' },
    varieties: [{ type: String, trim: true }],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Commodity = mongoose.model('Commodity', commoditySchema);
