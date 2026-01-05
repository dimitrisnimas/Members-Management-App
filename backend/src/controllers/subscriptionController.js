const { query } = require('../config/database');
const { addMonths, addDays, format, subDays } = require('date-fns');

const getUserSubscriptions = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check permissions
        if (req.user.role !== 'superadmin' && req.user.id !== parseInt(userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const result = await query(
            'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get subscriptions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createSubscription = async (req, res) => {
    try {
        const { user_id, member_type, duration_months, price, start_date } = req.body;

        const startDate = new Date(start_date);
        const endDate = addMonths(startDate, duration_months);

        const result = await query(
            `INSERT INTO subscriptions 
       (user_id, member_type, duration_months, price, start_date, end_date, status, auto_renew)
       VALUES ($1, $2, $3, $4, $5, $6, 'active', true)
       RETURNING *`,
            [user_id, member_type, duration_months, price, startDate, endDate]
        );

        // Log action
        await query(
            'INSERT INTO action_history (user_id, action_type, action_description, performed_by, metadata) VALUES ($1, $2, $3, $4, $5)',
            [user_id, 'subscription_create', `Created ${duration_months}-month ${member_type} subscription`, req.user.id, JSON.stringify(result.rows[0])]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create subscription error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { member_type, duration_months, price, end_date, status } = req.body;

        const result = await query(
            `UPDATE subscriptions 
       SET member_type = $1, duration_months = $2, price = $3, end_date = $4, status = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
            [member_type, duration_months, price, end_date, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        // Log action
        await query(
            'INSERT INTO action_history (user_id, action_type, action_description, performed_by, metadata) VALUES ($1, $2, $3, $4, $5)',
            [result.rows[0].user_id, 'subscription_update', 'Updated subscription details', req.user.id, JSON.stringify(result.rows[0])]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update subscription error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getUserSubscriptions,
    createSubscription,
    updateSubscription
};
