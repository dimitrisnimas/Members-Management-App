import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { format } from 'date-fns';

const PaymentHistory = ({ payments }) => {
    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Payment History
            </Typography>

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Method</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Notes</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payments && payments.length > 0 ? (
                            payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>{format(new Date(payment.created_at), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>€{payment.amount}</TableCell>
                                    <TableCell style={{ textTransform: 'capitalize' }}>{payment.payment_method.replace('_', ' ')}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={payment.payment_status}
                                            size="small"
                                            color={payment.payment_status === 'completed' ? 'success' : 'warning'}
                                        />
                                    </TableCell>
                                    <TableCell>{payment.notes || '-'}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No payments found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default PaymentHistory;
