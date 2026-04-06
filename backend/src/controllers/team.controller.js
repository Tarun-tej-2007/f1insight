const Team = require('../models/Team');
const { asyncHandler } = require('../middleware/error.middleware');

exports.getAll = asyncHandler(async (_req, res) => {
  const teams = await Team.find().sort('name');
  res.json({ success: true, count: teams.length, data: teams });
});

exports.getOne = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
  res.json({ success: true, data: team });
});

exports.create = asyncHandler(async (req, res) => {
  const team = await Team.create(req.body);
  res.status(201).json({ success: true, data: team });
});

exports.update = asyncHandler(async (req, res) => {
  const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
  res.json({ success: true, data: team });
});

exports.remove = asyncHandler(async (req, res) => {
  const team = await Team.findByIdAndDelete(req.params.id);
  if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
  res.json({ success: true, message: 'Team deleted' });
});
