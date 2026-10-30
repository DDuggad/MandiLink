import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema(
  {
    mandiId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mandi', required: true },
    commodityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commodity',
      required: true,
    },
    variety: { type: String, trim: true, default: '' },
    grade: { type: String, trim: true },
    // Price date normalised to start-of-day IST (UTC+5:30).
    // We store a plain Date; when inserting, callers must strip the time component.
    date: { type: Date, required: true, index: true },
    minPrice: { type: Number, required: true, min: 0 },
    maxPrice: { type: Number, required: true, min: 0 },
    modalPrice: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'quintal' },
    arrivals: { type: Number, min: 0 }, // optional, in tonnes
    source: { type: String, enum: ['seed', 'api', 'manual'], default: 'seed' },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Unique: one record per (mandi, commodity, variety, date)
priceSchema.index({ mandiId: 1, commodityId: 1, variety: 1, date: 1 }, { unique: true });
priceSchema.index({ commodityId: 1, date: -1 });
priceSchema.index({ mandiId: 1, date: -1 });
// Needed for delta sync: clients pull records updated after their lastSyncedAt
priceSchema.index({ updatedAt: 1 });

export const Price = mongoose.model('Price', priceSchema);
