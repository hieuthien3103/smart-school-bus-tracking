const express = require('express');
const router = express.Router();
const busLocationController = require('../controllers/busLocationController');

router.get('/active', busLocationController.getActiveBuses);
router.get('/:busId', busLocationController.getLatest);
router.get('/:busId/history', busLocationController.getHistory);
router.post('/', busLocationController.create);

module.exports = router;

