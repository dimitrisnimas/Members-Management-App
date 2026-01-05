const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const createPaymentIntent = async (amount, currency = 'eur') => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects cents
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });
        return paymentIntent;
    } catch (error) {
        console.error('Stripe create payment intent error:', error);
        throw error;
    }
};

const constructEvent = (payload, signature) => {
    try {
        return stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error('Stripe webhook error:', error);
        throw error;
    }
};

module.exports = {
    createPaymentIntent,
    constructEvent
};
