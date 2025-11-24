const express = require('express');
const router = express.Router();
const routesController = require('../controllers/routesController');

router.get('/', routesController.getAll);
router.get('/for-role', routesController.getRoutesForRole);
router.get('/:id', routesController.getById);
router.get('/:id/details', routesController.getRouteDetails);
router.post('/', routesController.create);
router.put('/:id', routesController.update);
router.delete('/:id', routesController.delete);

module.exports = router;
