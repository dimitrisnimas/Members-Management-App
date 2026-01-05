import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h2" component="h1" gutterBottom>
                    SEPAM Members Management
                </Typography>
                <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
                    Complete solution for member registration, subscriptions, and management.
                </Typography>
                <Box sx={{ mt: 4 }}>
                    <Button variant="contained" component={Link} to="/register" size="large" sx={{ mr: 2 }}>
                        Register
                    </Button>
                    <Button variant="outlined" component={Link} to="/login" size="large">
                        Login
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default LandingPage;
