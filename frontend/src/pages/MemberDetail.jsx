import { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, CircularProgress, Paper, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import SubscriptionCard from '../components/SubscriptionCard';
import PaymentHistory from '../components/PaymentHistory';
import ActionHistory from '../components/ActionHistory';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const MemberDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [subscriptions, setSubscriptions] = useState([]);
    const [payments, setPayments] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Manual Upgrade Dialog State
    const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);
    const [upgradeForm, setUpgradeForm] = useState({
        member_type: 'Τακτικό',
        duration_months: 12,
        amount: 500,
        payment_method: 'bank_transfer',
        notes: ''
    });
    const [upgrading, setUpgrading] = useState(false);

    // Notification state
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // Pricing map
    const pricingMap = {
        'Τακτικό': { 1: 50, 3: 140, 6: 270, 9: 390, 12: 500 },
        'Υποστηρικτής': { 1: 30, 3: 85, 6: 160, 9: 230, 12: 300 }
    };

    const fetchData = async () => {
        try {
            const [userRes, subRes, payRes] = await Promise.all([
                api.get(`/users/${id}`),
                api.get(`/subscriptions/user/${id}`),
                api.get(`/payments/user/${id}`)
            ]);

            setMember(userRes.data);
            setSubscriptions(subRes.data);
            setPayments(payRes.data);

            // Fetch history
            try {
                const histRes = await api.get(`/users/${id}/history`);
                setHistory(histRes.data);
            } catch (err) {
                console.log('History endpoint not available');
                setHistory([]);
            }
        } catch (error) {
            console.error('Error fetching member details:', error);
            setNotification({ open: true, message: 'Error loading member details', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // Update amount when member_type or duration changes
    useEffect(() => {
        const price = pricingMap[upgradeForm.member_type]?.[upgradeForm.duration_months];
        if (price) {
            setUpgradeForm(prev => ({ ...prev, amount: price }));
        }
    }, [upgradeForm.member_type, upgradeForm.duration_months]);

    const handleManualUpgrade = async () => {
        try {
            setUpgrading(true);
            await api.post(`/subscriptions/manual-upgrade/${id}`, upgradeForm);
            setNotification({ open: true, message: 'Subscription upgraded successfully!', severity: 'success' });
            setOpenUpgradeDialog(false);
            fetchData();
            // Reset form
            setUpgradeForm({
                member_type: 'Τακτικό',
                duration_months: 12,
                amount: 500,
                payment_method: 'bank_transfer',
                notes: ''
            });
        } catch (error) {
            console.error('Error upgrading subscription:', error);
            setNotification({
                open: true,
                message: error.response?.data?.message || 'Error upgrading subscription',
                severity: 'error'
            });
        } finally {
            setUpgrading(false);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/members')} sx={{ mb: 2 }}>
                Back to Members
            </Button>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Member Details</Typography>
                        <Typography><strong>Name:</strong> {member?.first_name} {member?.last_name}</Typography>
                        <Typography><strong>Father's Name:</strong> {member?.fathers_name || 'N/A'}</Typography>
                        <Typography><strong>ID Number:</strong> {member?.id_number || 'N/A'}</Typography>
                        <Typography><strong>Email:</strong> {member?.email}</Typography>
                        <Typography><strong>Phone:</strong> {member?.phone || 'N/A'}</Typography>
                        <Typography><strong>Address:</strong> {member?.address || 'N/A'}</Typography>
                        <Typography><strong>Type:</strong> {member?.member_type || 'N/A'}</Typography>
                        <Typography><strong>Status:</strong> {member?.status}</Typography>
                    </Paper>

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => setOpenUpgradeDialog(true)}
                        sx={{ mb: 2 }}
                    >
                        Manual Subscription Upgrade
                    </Button>
                </Grid>

                <Grid item xs={12} md={8}>
                    <SubscriptionCard subscription={subscriptions[0]} />
                    <PaymentHistory payments={payments} />
                    <ActionHistory history={history} userId={id} />
                </Grid>
            </Grid>

            {/* Manual Upgrade Dialog */}
            <Dialog open={openUpgradeDialog} onClose={() => !upgrading && setOpenUpgradeDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Manual Subscription Upgrade</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <TextField
                            select
                            label="Member Type"
                            fullWidth
                            margin="normal"
                            value={upgradeForm.member_type}
                            onChange={(e) => setUpgradeForm({ ...upgradeForm, member_type: e.target.value })}
                        >
                            <MenuItem value="Τακτικό">Τακτικό (Regular)</MenuItem>
                            <MenuItem value="Υποστηρικτής">Υποστηρικτής (Supporter)</MenuItem>
                        </TextField>

                        <TextField
                            select
                            label="Duration"
                            fullWidth
                            margin="normal"
                            value={upgradeForm.duration_months}
                            onChange={(e) => setUpgradeForm({ ...upgradeForm, duration_months: parseInt(e.target.value) })}
                        >
                            <MenuItem value={1}>1 Month</MenuItem>
                            <MenuItem value={3}>3 Months</MenuItem>
                            <MenuItem value={6}>6 Months</MenuItem>
                            <MenuItem value={9}>9 Months</MenuItem>
                            <MenuItem value={12}>12 Months</MenuItem>
                        </TextField>

                        <TextField
                            label="Amount (€)"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={upgradeForm.amount}
                            onChange={(e) => setUpgradeForm({ ...upgradeForm, amount: parseFloat(e.target.value) })}
                            helperText="Amount is auto-filled based on pricing, but can be adjusted"
                        />

                        <TextField
                            select
                            label="Payment Method"
                            fullWidth
                            margin="normal"
                            value={upgradeForm.payment_method}
                            onChange={(e) => setUpgradeForm({ ...upgradeForm, payment_method: e.target.value })}
                        >
                            <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                            <MenuItem value="cash">Cash</MenuItem>
                            <MenuItem value="check">Check</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </TextField>

                        <TextField
                            label="Notes"
                            multiline
                            rows={3}
                            fullWidth
                            margin="normal"
                            value={upgradeForm.notes}
                            onChange={(e) => setUpgradeForm({ ...upgradeForm, notes: e.target.value })}
                            placeholder="Add any notes about this payment..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUpgradeDialog(false)} disabled={upgrading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleManualUpgrade}
                        variant="contained"
                        disabled={upgrading}
                    >
                        {upgrading ? 'Processing...' : 'Upgrade Subscription'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default MemberDetail;

