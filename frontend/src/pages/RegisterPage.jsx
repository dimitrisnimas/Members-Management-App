import { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Alert, Paper, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        fathers_name: '',
        id_number: '',
        phone: '',
        address: '',
        member_type: 'Τακτικό'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await register(formData);
            setSuccess(true);
        } catch (err) {
            setError('Failed to register. ' + (err.response?.data?.message || ''));
        }
    };

    if (success) {
        return (
            <Container maxWidth="sm">
                <Box sx={{ mt: 8 }}>
                    <Alert severity="success">
                        Registration successful! Your account is pending approval. You will receive an email once approved.
                    </Alert>
                    <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
                        Return to Home
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" align="center" gutterBottom>
                        Register
                    </Typography>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="First Name"
                                name="first_name"
                                fullWidth
                                margin="normal"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                label="Last Name"
                                name="last_name"
                                fullWidth
                                margin="normal"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Father's Name"
                                name="fathers_name"
                                fullWidth
                                margin="normal"
                                value={formData.fathers_name}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                label="ID Number"
                                name="id_number"
                                fullWidth
                                margin="normal"
                                value={formData.id_number}
                                onChange={handleChange}
                            />
                        </Box>
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            fullWidth
                            margin="normal"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <TextField
                            label="Phone"
                            name="phone"
                            fullWidth
                            margin="normal"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Address"
                            name="address"
                            fullWidth
                            margin="normal"
                            value={formData.address}
                            onChange={handleChange}
                            multiline
                            rows={2}
                        />
                        <TextField
                            select
                            label="Member Type"
                            name="member_type"
                            fullWidth
                            margin="normal"
                            value={formData.member_type}
                            onChange={handleChange}
                        >
                            <MenuItem value="Τακτικό">Τακτικό</MenuItem>
                            <MenuItem value="Υποστηρικτής">Υποστηρικτής</MenuItem>
                        </TextField>
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <TextField
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{ mt: 3 }}
                        >
                            Register
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default RegisterPage;
