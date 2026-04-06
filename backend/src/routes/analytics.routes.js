const router = require('express').Router();
const { getAll } = require('../controllers/analytics.controller');

router.get('/', getAll);

module.exports = router;
