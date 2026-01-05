import { Paper, Typography, Box, TextField, Button, Alert } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const StripePaymentForm = () => {
    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3, opacity: 0.7 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CreditCardIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                    Pay with Card (Stripe)
                </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
                Online payments are currently disabled. Please use bank transfer.
            </Alert>

            <Box component="form" noValidate autoComplete="off">
                <TextField
                    label="Card Number"
                    fullWidth
                    margin="normal"
                    disabled
                    defaultValue="**** **** **** ****"
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Expiry"
                        fullWidth
                        margin="normal"
                        disabled
                        defaultValue="MM/YY"
                    />
                    <TextField
                        label="CVC"
                        fullWidth
                        margin="normal"
                        disabled
                        defaultValue="***"
                    />
                </Box>
                <Button variant="contained" fullWidth disabled sx={{ mt: 2 }}>
                    Pay Now
                </Button>
            </Box>
        </Paper>
    );
};

export default StripePaymentForm;
