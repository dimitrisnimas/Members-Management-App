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
        await emailService.sendApprovalEmail(user);

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
        await emailService.sendDenialEmail(user);

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

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, fathers_name, id_number, email, phone, address, member_type } = req.body;

        const result = await query(
            `UPDATE users SET first_name = $1, last_name = $2, fathers_name = $3, id_number = $4, 
             email = $5, phone = $6, address = $7, member_type = $8, updated_at = NOW() 
             WHERE id = $9 RETURNING *`,
            [first_name, last_name, fathers_name, id_number, email, phone, address, member_type, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Log the update
        const actionLogger = require('../services/actionLogger');
        await actionLogger.logAction({
            userId: id,
            actionType: 'member_update',
            actionDescription: 'Member information updated',
            performedBy: req.user.id
        });

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Get user info before deletion for logging
        const user = await query('SELECT * FROM users WHERE id = $1', [id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete related data first (subscriptions, payments, action history)
        await query('DELETE FROM subscriptions WHERE user_id = $1', [id]);
        await query('DELETE FROM payments WHERE user_id = $1', [id]);
        await query('DELETE FROM action_history WHERE user_id = $1', [id]);

        // Delete the user
        await query('DELETE FROM users WHERE id = $1', [id]);

        // Log the deletion
        const actionLogger = require('../services/actionLogger');
        await actionLogger.logAction({
            userId: req.user.id, // Log under admin's ID since user is deleted
            actionType: 'member_deletion',
            actionDescription: `Deleted member: ${user.rows[0].first_name} ${user.rows[0].last_name}`,
            performedBy: req.user.id,
            metadata: { deleted_user_id: id }
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getExpiringMembers = async (req, res) => {
    try {
        const result = await query(
            `SELECT * FROM users 
             WHERE member_type = 'Τακτικό' 
             AND status = 'approved'
             AND created_at + INTERVAL '1 year' BETWEEN NOW() AND NOW() + INTERVAL '30 days'
             ORDER BY created_at ASC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get expiring members error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    approveUser,
    denyUser,
    getUserHistory,
    updateUser,
    deleteUser,
    getExpiringMembers
};
