import mongoose from 'mongoose';

const transporterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // Required for tap-to-call; must be a valid Indian mobile/STD number
    phone: { type: String, required: true, trim: true },
    languages: [{ type: String, trim: true }],
    vehicleTypes: [{ type: String, trim: true }], // e.g. 'tempo', 'mini truck', 'truck', 'tractor trolley'
    capacityKg: { type: Number, min: 0 },
    ratePerKm: { type: Number, min: 0 },
    baseLocation: {
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
    serviceDistricts: [{ type: String, trim: true }],
    serviceRadiusKm: { type: Number, min: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for nearby transporters geo queries
transporterSchema.index({ baseLocation: '2dsphere' });
transporterSchema.index({ updatedAt: 1 });

export const Transporter = mongoose.model('Transporter', transporterSchema);
