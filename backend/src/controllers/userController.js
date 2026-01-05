const { query } = require('../config/database');
const emailService = require('../services/emailService');

const getAllUsers = async (req, res) => {
    try {
        const result = await query('SELECT id, email, first_name, last_name, role, status, member_type, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT id, email, first_name, last_name, fathers_name, id_number, phone, address, role, status, member_type, created_at FROM users WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check permissions: superadmin or own profile
        if (req.user.role !== 'superadmin' && req.user.id !== parseInt(id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const approveUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            'UPDATE users SET status = $1, approved_at = NOW(), approved_by = $2 WHERE id = $3 RETURNING *',
            ['approved', req.user.id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        // Send email
        await emailService.sendEmail(
            user.email,
            'Account Approved - Members App',
            `<h2>Account Approved</h2><p>Hello ${user.first_name} ${user.last_name},</p><p>Your account has been approved. You can now log in.</p>`
        );

        // Log action
        await query(
            'INSERT INTO action_history (user_id, action_type, action_description, performed_by) VALUES ($1, $2, $3, $4)',
            [user.id, 'approval', 'User account approved', req.user.id]
        );

        res.json({ message: 'User approved successfully', user });
    } catch (error) {
        console.error('Approve user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const denyUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            'UPDATE users SET status = $1 WHERE id = $2 RETURNING *',
            ['denied', id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        // Send email
        await emailService.sendEmail(
            user.email,
            'Account Update - Members App',
            `<h2>Account Update</h2><p>Hello ${user.first_name} ${user.last_name},</p><p>Your account application has been denied.</p>`
        );

        // Log action
        await query(
            'INSERT INTO action_history (user_id, action_type, action_description, performed_by) VALUES ($1, $2, $3, $4)',
            [user.id, 'denial', 'User account denied', req.user.id]
        );

        res.json({ message: 'User denied successfully', user });
    } catch (error) {
        console.error('Deny user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserHistory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check permissions
        if (req.user.role !== 'superadmin' && req.user.id !== parseInt(id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const result = await query(
            'SELECT * FROM action_history WHERE user_id = $1 ORDER BY created_at DESC',
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get user history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    approveUser,
    denyUser,
    getUserHistory
};
