const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    number: { type: String, trim: true },
    nationality: { type: String, trim: true },
    dateOfBirth: { type: Date },
    bio: { type: String },
    imageUrl: { type: String },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Driver', driverSchema);
