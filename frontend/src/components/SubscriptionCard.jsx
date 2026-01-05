import { Paper, Typography, Box, Chip, Button } from '@mui/material';
import { format, differenceInDays } from 'date-fns';

const SubscriptionCard = ({ subscription }) => {
    if (!subscription) {
        return (
            <Paper elevation={2} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    No active subscription
                </Typography>
            </Paper>
        );
    }

    const daysRemaining = differenceInDays(new Date(subscription.end_date), new Date());
    const isExpiringSoon = daysRemaining <= 10 && daysRemaining >= 0;
    const isExpired = daysRemaining < 0;

    let statusColor = 'success';
    if (isExpired) statusColor = 'error';
    else if (isExpiringSoon) statusColor = 'warning';

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6">
                    Current Subscription
                </Typography>
                <Chip
                    label={isExpired ? 'Expired' : (isExpiringSoon ? 'Expiring Soon' : 'Active')}
                    color={statusColor}
                    variant="outlined"
                />
            </Box>

            <Typography variant="h4" color="primary" gutterBottom>
                {subscription.member_type}
            </Typography>

            <Box sx={{ my: 2 }}>
                <Typography variant="body1">
                    <strong>Duration:</strong> {subscription.duration_months} Months
                </Typography>
                <Typography variant="body1">
                    <strong>Price:</strong> €{subscription.price}
                </Typography>
                <Typography variant="body1">
                    <strong>Start Date:</strong> {format(new Date(subscription.start_date), 'dd/MM/yyyy')}
                </Typography>
                <Typography variant="body1">
                    <strong>End Date:</strong> {format(new Date(subscription.end_date), 'dd/MM/yyyy')}
                </Typography>
            </Box>

            {isExpiringSoon && (
                <Typography color="error" sx={{ mt: 2, fontWeight: 'bold' }}>
                    Your subscription expires in {daysRemaining} days. Please renew!
                </Typography>
            )}
        </Paper>
    );
};

export default SubscriptionCard;
