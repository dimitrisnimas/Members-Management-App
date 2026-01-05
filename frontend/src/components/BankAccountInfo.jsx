import { Paper, Typography, Box, Divider, Button } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const BankAccountInfo = () => {
    // In a real app, fetch this from API /settings/bank-accounts
    const accounts = [
        { bank: 'Piraeus Bank', iban: 'GR12 3456 7890 1234 5678 9012 345', holder: 'Organization Name' },
        { bank: 'Alpha Bank', iban: 'GR98 7654 3210 9876 5432 1098 765', holder: 'Organization Name' }
    ];

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could add a snackbar notification here
    };

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Bank Account Details
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Please use your email as the payment reference.
            </Typography>

            {accounts.map((acc, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                    {index > 0 && <Divider sx={{ my: 2 }} />}
                    <Typography variant="subtitle1" fontWeight="bold">
                        {acc.bank}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                            {acc.iban}
                        </Typography>
                        <Button
                            startIcon={<ContentCopyIcon />}
                            size="small"
                            onClick={() => copyToClipboard(acc.iban)}
                        >
                            Copy
                        </Button>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Holder: {acc.holder}
                    </Typography>
                </Box>
            ))}
        </Paper>
    );
};

export default BankAccountInfo;
