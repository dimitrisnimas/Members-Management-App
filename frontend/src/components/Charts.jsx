import { Paper, Typography, Box, Grid } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Charts = ({ memberGrowth, subscriptionDistribution }) => {
    return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
                <Paper elevation={2} sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" gutterBottom>
                        Member Growth (Last 6 Months)
                    </Typography>
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={memberGrowth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" gutterBottom>
                        Subscription Types
                    </Typography>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie
                                data={subscriptionDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="member_type"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {subscriptionDistribution && subscriptionDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default Charts;
