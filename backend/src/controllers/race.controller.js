const Race = require('../models/Race');
const { asyncHandler } = require('../middleware/error.middleware');

exports.getAll = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.season) filter.season = req.query.season;
  if (req.query.status) filter.status = req.query.status;
  const races = await Race.find(filter).sort('date');
  res.json({ success: true, count: races.length, data: races });
});

exports.getOne = asyncHandler(async (req, res) => {
  const race = await Race.findById(req.params.id);
  if (!race) return res.status(404).json({ success: false, message: 'Race not found' });
  res.json({ success: true, data: race });
});

exports.create = asyncHandler(async (req, res) => {
  const race = await Race.create(req.body);
  res.status(201).json({ success: true, data: race });
});

exports.update = asyncHandler(async (req, res) => {
  const race = await Race.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!race) return res.status(404).json({ success: false, message: 'Race not found' });
  res.json({ success: true, data: race });
});

exports.remove = asyncHandler(async (req, res) => {
  const race = await Race.findByIdAndDelete(req.params.id);
  if (!race) return res.status(404).json({ success: false, message: 'Race not found' });
  res.json({ success: true, message: 'Race deleted' });
});
