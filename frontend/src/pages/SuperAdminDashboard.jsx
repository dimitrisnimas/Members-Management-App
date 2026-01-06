import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const SuperAdminDashboard = () => {
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
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Overview of your organization</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                        <p className="text-gray-500 text-sm font-medium">Total Members</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalMembers || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
                        <p className="text-gray-500 text-sm font-medium">Pending Approvals</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.pendingApprovals || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                        <p className="text-gray-500 text-sm font-medium">Active Subscriptions</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.activeSubscriptions || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
                        <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">€{stats?.totalRevenue || 0}</p>
                    </div>
                </div>

                {/* Charts */}
                {chartsData && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Member Growth Chart */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Member Growth</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartsData.memberGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Subscription Distribution Chart */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Types</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartsData.subscriptionDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="member_type" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" fill="#10B981" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SuperAdminDashboard;
