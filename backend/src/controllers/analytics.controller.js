const analyticsService = require('../services/analytics.service');
const { asyncHandler } = require('../middleware/error.middleware');

exports.getAll = asyncHandler(async (_req, res) => {
  const data = await analyticsService.getAnalytics();
  res.json({ success: true, data });
});
