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

const getCharts = async (req, res) => {
    try {
        // Member growth (last 6 months)
        const growthResult = await query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count
      FROM users
      WHERE role = 'user'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `);

        // Subscription distribution
        const distributionResult = await query(`
      SELECT member_type, COUNT(*) as count
      FROM subscriptions
      WHERE status = 'active'
      GROUP BY member_type
    `);

        res.json({
            memberGrowth: growthResult.rows.reverse(),
            subscriptionDistribution: distributionResult.rows
        });
    } catch (error) {
        console.error('Get dashboard charts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getStats,
    getCharts
};
