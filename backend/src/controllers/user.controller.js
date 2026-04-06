const User = require('../models/User');
const { asyncHandler } = require('../middleware/error.middleware');

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('favorites.drivers', 'name number nationality team')
    .populate('favorites.teams', 'name color shortName');
  res.json({ success: true, data: user });
});

exports.toggleFavoriteDriver = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { driverId } = req.params;
  const idx = user.favorites.drivers.indexOf(driverId);
  if (idx >= 0) user.favorites.drivers.splice(idx, 1);
  else user.favorites.drivers.push(driverId);
  await user.save();
  res.json({ success: true, data: user.favorites });
});

exports.toggleFavoriteTeam = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { teamId } = req.params;
  const idx = user.favorites.teams.indexOf(teamId);
  if (idx >= 0) user.favorites.teams.splice(idx, 1);
  else user.favorites.teams.push(teamId);
  await user.save();
  res.json({ success: true, data: user.favorites });
});
