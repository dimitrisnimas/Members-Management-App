import { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Charts from '../components/Charts';
import MembersList from './MembersList'; // Will create next

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [chartsData, setChartsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, chartsRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/charts')
                ]);
                setStats(statsRes.data);
                setChartsData(chartsRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Total Members</Typography>
                            <Typography variant="h4">{stats?.totalMembers || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Pending Approvals</Typography>
                            <Typography variant="h4" color="warning.main">{stats?.pendingApprovals || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Active Subscriptions</Typography>
                            <Typography variant="h4" color="success.main">{stats?.activeSubscriptions || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Total Revenue</Typography>
                            <Typography variant="h4">€{stats?.totalRevenue || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts */}
            {chartsData && (
                <Charts
                    memberGrowth={chartsData.memberGrowth}
                    subscriptionDistribution={chartsData.subscriptionDistribution}
                />
            )}

            {/* Members List */}
            <MembersList />
        </Container>
    );
};

export default SuperAdminDashboard;
