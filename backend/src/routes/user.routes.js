const router = require('express').Router();
const { getProfile, toggleFavoriteDriver, toggleFavoriteTeam } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/profile', protect, getProfile);
router.post('/favorites/drivers/:driverId', protect, toggleFavoriteDriver);
router.post('/favorites/teams/:teamId', protect, toggleFavoriteTeam);

module.exports = router;
