const { query } = require('../config/database');

const getStats = async (req, res) => {
    try {
        // Total members
        const totalMembersResult = await query('SELECT COUNT(*) FROM users WHERE role = \'user\'');
        const totalMembers = parseInt(totalMembersResult.rows[0].count);

        // Pending approvals
        const pendingResult = await query('SELECT COUNT(*) FROM users WHERE status = \'pending\'');
        const pendingApprovals = parseInt(pendingResult.rows[0].count);

        // Active subscriptions
        const activeSubsResult = await query('SELECT COUNT(*) FROM subscriptions WHERE status = \'active\'');
        const activeSubscriptions = parseInt(activeSubsResult.rows[0].count);

        // Total revenue (sum of completed payments)
        const revenueResult = await query('SELECT SUM(amount) FROM payments WHERE payment_status = \'completed\'');
        const totalRevenue = parseFloat(revenueResult.rows[0].sum || 0);

        res.json({
            totalMembers,
            pendingApprovals,
            activeSubscriptions,
            totalRevenue
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getStatistics = async (req, res) => {
    try {
        // Total members
        const totalResult = await query('SELECT COUNT(*) FROM users WHERE role = \'user\'');
        const totalMembers = parseInt(totalResult.rows[0].count);

        // Membership distribution
        const membershipResult = await query(
            `SELECT member_type, COUNT(*) as count FROM users 
             WHERE role = 'user' GROUP BY member_type`
        );
        const membershipDistribution = {
            regular: 0,
            supporter: 0
        };
        membershipResult.rows.forEach(row => {
            if (row.member_type === 'Τακτικό') membershipDistribution.regular = parseInt(row.count);
            if (row.member_type === 'Υποστηρικτής') membershipDistribution.supporter = parseInt(row.count);
        });

        // Status distribution
        const activeResult = await query(
            `SELECT COUNT(*) FROM users 
             WHERE member_type = 'Τακτικό' 
             AND status = 'approved'
             AND created_at + INTERVAL '1 year' > NOW()`
        );
        const expiringResult = await query(
            `SELECT COUNT(*) FROM users 
             WHERE member_type = 'Τακτικό' 
             AND status = 'approved'
             AND created_at + INTERVAL '1 year' BETWEEN NOW() AND NOW() + INTERVAL '30 days'`
        );
        const expiredResult = await query(
            `SELECT COUNT(*) FROM users 
             WHERE member_type = 'Τακτικό' 
             AND status = 'approved'
             AND created_at + INTERVAL '1 year' < NOW()`
        );

        const statusDistribution = {
            active: parseInt(activeResult.rows[0].count),
            expiring: parseInt(expiringResult.rows[0].count),
            expired: parseInt(expiredResult.rows[0].count)
        };

        res.json({
            totalMembers,
            membershipDistribution,
            statusDistribution
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getLogs = async (req, res) => {
    try {
        const { actionType, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let whereConditions = [];
        let values = [];
        let paramCount = 1;

        if (actionType) {
            whereConditions.push(`action_type = $${paramCount}`);
            values.push(actionType);
            paramCount++;
        }

        if (dateFrom) {
            whereConditions.push(`created_at >= $${paramCount}`);
            values.push(dateFrom);
            paramCount++;
        }

        if (dateTo) {
            whereConditions.push(`created_at <= $${paramCount}`);
            values.push(dateTo);
            paramCount++;
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        const countResult = await query(
            `SELECT COUNT(*) FROM action_history ${whereClause}`,
            values
        );

        const result = await query(
            `SELECT * FROM action_history ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
            [...values, limit, offset]
        );

        res.json({
            logs: result.rows,
            totalPages: Math.ceil(countResult.rows[0].count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const checkExpiredMembers = async (req, res) => {
    try {
        // Find expired members
        const expiredResult = await query(
            `SELECT * FROM users 
             WHERE member_type = 'Τακτικό' 
             AND status = 'approved'
             AND created_at + INTERVAL '1 year' < NOW()`
        );

        let updatedCount = 0;
        const actionLogger = require('../services/actionLogger');

        for (const user of expiredResult.rows) {
            // Update to Υποστηρικτής
            await query(
                `UPDATE users SET member_type = 'Υποστηρικτής', updated_at = NOW() WHERE id = $1`,
                [user.id]
            );

            // Mark subscriptions as expired
            await query(
                `UPDATE subscriptions SET status = 'expired' WHERE user_id = $1 AND status = 'active'`,
                [user.id]
            );

            // Log the conversion
            await actionLogger.logAutoConversion(user.id, 'Τακτικό', 'Υποστηρικτής');

            updatedCount++;
        }

        res.json({ updatedCount });
    } catch (error) {
        console.error('Check expired members error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getStats,
    getStatistics,
    getLogs,
    checkExpiredMembers
};
