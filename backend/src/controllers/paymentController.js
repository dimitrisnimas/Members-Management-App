const { query } = require('../config/database');
const stripeService = require('../services/stripeService');
const emailService = require('../services/emailService');

const getUserPayments = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check permissions
        if (req.user.role !== 'superadmin' && req.user.id !== parseInt(userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const result = await query(
            'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const recordPayment = async (req, res) => {
    try {
        const { user_id, subscription_id, amount, payment_method, notes } = req.body;

        const result = await query(
            `INSERT INTO payments 
       (user_id, subscription_id, amount, payment_method, payment_status, payment_date, notes)
       VALUES ($1, $2, $3, $4, 'completed', NOW(), $5)
       RETURNING *`,
            [user_id, subscription_id, amount, payment_method, notes]
        );

        // Log action
        await query(
            'INSERT INTO action_history (user_id, action_type, action_description, performed_by, metadata) VALUES ($1, $2, $3, $4, $5)',
            [user_id, 'payment_record', `Recorded payment of €${amount}`, req.user.id, JSON.stringify(result.rows[0])]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Record payment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createStripeIntent = async (req, res) => {
    try {
        const { amount } = req.body;
        const paymentIntent = await stripeService.createPaymentIntent(amount);
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ message: 'Stripe error' });
    }
};

const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeService.constructEvent(req.body, sig);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        // Logic to update payment status in DB would go here
        // Need to match paymentIntent.id with a pending payment record
        console.log('Payment succeeded:', paymentIntent.id);
    }

    res.json({ received: true });
};

module.exports = {
    getUserPayments,
    recordPayment,
    createStripeIntent,
    handleStripeWebhook
};
