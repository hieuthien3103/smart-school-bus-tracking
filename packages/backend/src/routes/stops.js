const express = require('express');
const router = express.Router();
const stopsController = require('../controllers/stopsController');

router.get('/', stopsController.getAll);
router.get('/:id', stopsController.getById);
router.post('/', stopsController.create);
router.put('/:id', stopsController.update);
router.delete('/:id', stopsController.delete);

module.exports = router;
