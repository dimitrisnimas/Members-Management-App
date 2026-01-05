import { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, CircularProgress, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import SubscriptionCard from '../components/SubscriptionCard';
import PaymentHistory from '../components/PaymentHistory';
import ActionHistory from '../components/ActionHistory';
import BankAccountInfo from '../components/BankAccountInfo';
import StripePaymentForm from '../components/StripePaymentForm';

const UserProfile = () => {
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState([]);
    const [payments, setPayments] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subRes, payRes, histRes] = await Promise.all([
                    api.get(`/subscriptions/user/${user.id}`),
                    api.get(`/payments/user/${user.id}`),
                    api.get(`/export/user/${user.id}/history`, { responseType: 'json' }).catch(() => ({ data: [] }))
                ]);

                setSubscriptions(subRes.data);
                setPayments(payRes.data);
                // setHistory(histRes.data);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    if (loading) return <CircularProgress />;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                My Profile
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <SubscriptionCard subscription={subscriptions[0]} />
                    <PaymentHistory payments={payments} />
                    {/* <ActionHistory history={history} userId={user.id} /> */}
                </Grid>

                <Grid item xs={12} md={4}>
                    <BankAccountInfo />
                    <StripePaymentForm />
                </Grid>
            </Grid>
        </Container>
    );
};

export default UserProfile;
