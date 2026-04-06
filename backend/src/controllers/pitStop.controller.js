const PitStop = require('../models/PitStop');
const { asyncHandler } = require('../middleware/error.middleware');

exports.getAll = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.race) filter.race = req.query.race;
  if (req.query.team) filter.team = req.query.team;
  if (req.query.driver) filter.driver = req.query.driver;
  const pitStops = await PitStop.find(filter)
    .populate('driver', 'name number')
    .populate('team', 'name color')
    .populate('race', 'name date')
    .sort('duration');
  res.json({ success: true, count: pitStops.length, data: pitStops });
});

exports.create = asyncHandler(async (req, res) => {
  const pitStop = await PitStop.create(req.body);
  await pitStop.populate('driver team race');
  res.status(201).json({ success: true, data: pitStop });
});

exports.remove = asyncHandler(async (req, res) => {
  const ps = await PitStop.findByIdAndDelete(req.params.id);
  if (!ps) return res.status(404).json({ success: false, message: 'Pit stop not found' });
  res.json({ success: true, message: 'Pit stop deleted' });
});
