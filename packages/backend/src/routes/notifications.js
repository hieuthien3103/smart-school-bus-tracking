const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');

router.get('/', notificationsController.getAll);
router.get('/:id', notificationsController.getById);
router.post('/', notificationsController.create);
router.delete('/:id', notificationsController.delete);

module.exports = router;
