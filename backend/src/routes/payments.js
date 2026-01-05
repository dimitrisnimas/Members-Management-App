const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Webhook needs raw body, so it might need special middleware handling in server.js if using body-parser globally
// For now, assuming standard JSON parsing is fine or handled elsewhere for webhooks
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhook);

router.use(authenticateToken);

router.get('/user/:userId', paymentController.getUserPayments);
router.post('/', requireRole(['superadmin']), paymentController.recordPayment);
router.post('/create-intent', paymentController.createStripeIntent);

module.exports = router;
