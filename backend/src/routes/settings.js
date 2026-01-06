const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

// Public routes
router.get('/bank-accounts', settingsController.getBankAccounts);
router.get('/pricing', settingsController.getPricing);

// Admin routes
router.get('/', authenticateToken, requireSuperAdmin, settingsController.getAllSettings);
router.get('/:key', authenticateToken, requireSuperAdmin, settingsController.getSetting);
router.put('/:key', authenticateToken, requireSuperAdmin, settingsController.updateSetting);

module.exports = router;
