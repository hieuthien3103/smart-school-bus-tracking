const express = require('express');
const router = express.Router();
const parentsController = require('../controllers/parentsController');

router.get('/', parentsController.getAll);
router.get('/:id', parentsController.getById);
router.post('/', parentsController.create);
router.put('/:id', parentsController.update);
router.delete('/:id', parentsController.delete);

module.exports = router;
