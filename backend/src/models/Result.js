const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    position: { type: Number, required: true, min: 1, max: 22 },
    points: { type: Number, default: 0, min: 0 },
    gridPosition: { type: Number, min: 1, max: 22 },
    status: { type: String, enum: ['finished', 'dnf', 'dns', 'dsq'], default: 'finished' },
    fastestLap: { type: Boolean, default: false },
    lapsCompleted: { type: Number },
  },
  { timestamps: true }
);

resultSchema.index({ race: 1, driver: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
