const mongoose = require('mongoose');

const pitStopSchema = new mongoose.Schema(
  {
    race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    lap: { type: Number, required: true },
    duration: { type: Number, required: true, min: 0 }, // seconds
    stopNumber: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PitStop', pitStopSchema);
