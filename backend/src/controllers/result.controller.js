const Result = require('../models/Result');
const { asyncHandler } = require('../middleware/error.middleware');

const F1_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

exports.getAll = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.race) filter.race = req.query.race;
  if (req.query.driver) filter.driver = req.query.driver;
  const results = await Result.find(filter)
    .populate('driver', 'name number')
    .populate('team', 'name color')
    .populate('race', 'name date season round')
    .sort('position');
  res.json({ success: true, count: results.length, data: results });
});

exports.getOne = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id)
    .populate('driver team race');
  if (!result) return res.status(404).json({ success: false, message: 'Result not found' });
  res.json({ success: true, data: result });
});

exports.create = asyncHandler(async (req, res) => {
  // Auto-assign points if not provided
  if (req.body.points === undefined && req.body.position) {
    req.body.points = F1_POINTS[req.body.position - 1] || 0;
    // +1 for fastest lap if applicable
    if (req.body.fastestLap && req.body.position <= 10) req.body.points += 1;
  }
  const result = await Result.create(req.body);
  await result.populate('driver team race');
  res.status(201).json({ success: true, data: result });
});

exports.update = asyncHandler(async (req, res) => {
  const result = await Result.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  }).populate('driver team race');
  if (!result) return res.status(404).json({ success: false, message: 'Result not found' });
  res.json({ success: true, data: result });
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await Result.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ success: false, message: 'Result not found' });
  res.json({ success: true, message: 'Result deleted' });
});
