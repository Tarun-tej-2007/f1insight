const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shortName: { type: String, trim: true },
    nationality: { type: String, trim: true },
    color: { type: String, default: '#EE3F2C' },
    logoUrl: { type: String },
    founded: { type: Number },
    bio: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
