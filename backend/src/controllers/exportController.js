const { query } = require('../config/database');
const pdfService = require('../services/pdfService');

const exportUserHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check permissions
        if (req.user.role !== 'superadmin' && req.user.id !== parseInt(userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Fetch user
        const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = userResult.rows[0];

        // Fetch history
        const historyResult = await query('SELECT * FROM action_history WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

        // Fetch payments
        const paymentsResult = await query('SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=user_history_${userId}.pdf`);

        pdfService.generateUserHistoryPDF(user, historyResult.rows, paymentsResult.rows, res);
    } catch (error) {
        console.error('Export user history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    exportUserHistory
};
