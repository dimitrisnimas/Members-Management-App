const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/user/:userId/history', exportController.exportUserHistory);

module.exports = router;
