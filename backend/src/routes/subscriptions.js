const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/user/:userId', subscriptionController.getUserSubscriptions);
router.post('/', requireRole(['superadmin']), subscriptionController.createSubscription);
router.put('/:id', requireRole(['superadmin']), subscriptionController.updateSubscription);
router.post('/manual-upgrade/:userId', requireRole(['superadmin']), subscriptionController.manualUpgrade);

module.exports = router;

