const router = require('express').Router();
const c = require('../controllers/pitStop.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/', c.getAll);
router.post('/', protect, adminOnly, c.create);
router.delete('/:id', protect, adminOnly, c.remove);

module.exports = router;
