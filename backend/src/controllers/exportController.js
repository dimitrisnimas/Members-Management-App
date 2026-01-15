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


const exportMembersPDF = async (req, res) => {

    try {
        const { exportType, memberType, columns } = req.query; // columns is JSON string or array

        let queryText = 'SELECT * FROM users WHERE 1=1';
        const queryParams = [];
        let paramCount = 1;

        // Apply Filters
        if (memberType && memberType !== 'all') {
            queryText += ` AND member_type = $${paramCount}`;
            queryParams.push(memberType);
            paramCount++;
        }

        // Apply Export Type Logic
        if (exportType === 'active_members') {
            // Logic for active members: valid subscription? 
            // Simplified: status = 'approved' and maybe check subscription end_date if joined with subscriptions
            // For now, let's assume 'approved' users are active or use a more complex query if needed
            queryText += ` AND status = 'approved'`;
        } else if (exportType === 'expired_members') {
            // This would require joining with subscriptions or checking a status_expiry field
            // Assuming for now simple status check or we need to join most recent subscription
            // Let's implement a basic version that relies on user status if available
            // If we have auto-updater, user status might be 'expired'
        }

        queryText += ' ORDER BY created_at DESC';

        const result = await query(queryText, queryParams);
        let members = result.rows;

        // Parse columns
        let selectedColumns = [];
        if (columns) {
            try {
                selectedColumns = typeof columns === 'string' ? JSON.parse(columns) : columns;
            } catch (e) {
                console.error('Error parsing columns:', e);
            }
        }

        // Default columns if none provided
        if (!selectedColumns || selectedColumns.length === 0) {
            selectedColumns = [
                { key: 'full_name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'member_type', label: 'Type' },
                { key: 'status', label: 'Status' }
            ];
        }

        // Set headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=members_export_${new Date().toISOString().split('T')[0]}.pdf`);

        const title = exportType === 'statistics' ? 'Statistics Report' : 'Members Export';

        pdfService.generateMembersPDF(members, selectedColumns, title, res);

    } catch (error) {
        console.error('Export members PDF error:', error);
        res.status(500).json({ message: 'Server error exporting PDF' });
    }
};

module.exports = {
    exportUserHistory,
    exportMembersPDF
};
