const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const emailService = require('../services/emailService');

const register = async (req, res) => {
    try {
        const { email, password, first_name, last_name, fathers_name, id_number, phone, address, member_type } = req.body;

        // Check if user exists
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await userModel.createUser({
            email,
            password_hash,
            first_name,
            last_name,
            fathers_name,
            id_number,
            phone,
            address,
            member_type
        });

        // Send notifications
        await emailService.sendRegistrationNotificationToAdmin(newUser);
        await emailService.sendRegistrationConfirmationToUser(newUser);

        res.status(201).json({
            message: 'Registration successful. Please wait for admin approval.',
            user: {
                id: newUser.id,
                email: newUser.email,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                role: newUser.role,
                status: newUser.status
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check status
        if (user.status !== 'approved' && user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Account is not approved yet' });
        }

        // Create token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                status: user.status,
                member_type: user.member_type
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await userModel.findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    register,
    login,
    getMe
};
