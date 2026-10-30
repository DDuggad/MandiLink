import mongoose from 'mongoose';

const importLogSchema = new mongoose.Schema(
  {
    source: { type: String, default: 'data.gov.in (agmarknet)' },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date },
    status: {
      type: String,
      enum: ['running', 'completed', 'failed'],
      default: 'running',
    },
    recordsFetched: { type: Number, default: 0 },
    recordsInserted: { type: Number, default: 0 },
    recordsUpdated: { type: Number, default: 0 },
    errors: [{ type: String }],
    triggeredBy: { type: String, default: 'manual' },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

export const ImportLog = mongoose.model('ImportLog', importLogSchema);
