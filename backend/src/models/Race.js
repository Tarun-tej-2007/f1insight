const mongoose = require('mongoose');

const raceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    circuit: { type: String, trim: true },
    country: { type: String, trim: true },
    city: { type: String, trim: true },
    date: { type: Date, required: true },
    season: { type: String, required: true },
    round: { type: Number },
    laps: { type: Number },
    lapDistance: { type: Number },
    totalDistance: { type: Number },
    status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
  },
  { timestamps: true }
);

raceSchema.pre('save', function (next) {
  if (this.date < new Date()) this.status = 'completed';
  next();
});

module.exports = mongoose.model('Race', raceSchema);
