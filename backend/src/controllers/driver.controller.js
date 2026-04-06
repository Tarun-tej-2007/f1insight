const Driver = require('../models/Driver');
const { asyncHandler } = require('../middleware/error.middleware');

exports.getAll = asyncHandler(async (_req, res) => {
  const drivers = await Driver.find().populate('team', 'name color shortName').sort('name');
  res.json({ success: true, count: drivers.length, data: drivers });
});

exports.getOne = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id).populate('team');
  if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
  res.json({ success: true, data: driver });
});

exports.create = asyncHandler(async (req, res) => {
  const driver = await Driver.create(req.body);
  await driver.populate('team', 'name color');
  res.status(201).json({ success: true, data: driver });
});

exports.update = asyncHandler(async (req, res) => {
  const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  }).populate('team', 'name color');
  if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
  res.json({ success: true, data: driver });
});

exports.remove = asyncHandler(async (req, res) => {
  const driver = await Driver.findByIdAndDelete(req.params.id);
  if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
  res.json({ success: true, message: 'Driver deleted' });
});
