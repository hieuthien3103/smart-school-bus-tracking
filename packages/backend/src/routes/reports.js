const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

router.get('/overview', reportsController.getOverview);
router.get('/schedules', reportsController.getScheduleReport);
router.get('/drivers', reportsController.getDriverPerformance);

// Add missing endpoints that frontend is calling
router.get('/performance', reportsController.getPerformanceData);
router.get('/routes', reportsController.getRouteAnalysis);
router.get('/maintenance', reportsController.getMaintenanceData);

module.exports = router;
