const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRole(['superadmin']));

router.get('/stats', dashboardController.getStats);
router.get('/charts', dashboardController.getCharts);

module.exports = router;
