import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';

const AdminTools = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const checkExpiredMembers = async () => {
        try {
            setLoading(true);
            setResult(null);
            const response = await api.post('/dashboard/check-expired');
            setResult({
                type: 'success',
                message: `Successfully processed ${response.data.updatedCount} expired members`
            });
        } catch (error) {
            setResult({
                type: 'error',
                message: error.response?.data?.message || 'Failed to check expired members'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Tools</h1>
                    <p className="text-gray-600 mt-1">System maintenance and administrative functions</p>
                </div>

                {/* Result Message */}
                {result && (
                    <div className={`mb-6 p-4 rounded-lg ${result.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                        {result.message}
                    </div>
                )}

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Check Expired Members */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-start space-x-4">
                            <div className="bg-orange-100 rounded-lg p-3">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Check Expired Members
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Automatically convert members with expired "Τακτικό" memberships to "Υποστηρικτής" status.
                                    This checks all active subscriptions and updates those past their expiration date.
                                </p>
                                <button
                                    onClick={checkExpiredMembers}
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Processing...' : 'Run Expiration Check'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Database Cleanup */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-start space-x-4">
                            <div className="bg-blue-100 rounded-lg p-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Database Cleanup
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Clean up old logs and temporary data. This removes action history entries older than 90 days
                                    and optimizes database performance.
                                </p>
                                <button
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                                >
                                    Coming Soon
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* System Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-start space-x-4">
                            <div className="bg-purple-100 rounded-lg p-3">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    System Information
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Application Version:</span>
                                        <span className="font-medium text-gray-900">2.0.0</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Database:</span>
                                        <span className="font-medium text-gray-900">PostgreSQL</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Environment:</span>
                                        <span className="font-medium text-gray-900">Production</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Backup & Restore */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-start space-x-4">
                            <div className="bg-green-100 rounded-lg p-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Backup & Restore
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Create database backups and restore from previous backups. Ensure data safety and recovery options.
                                </p>
                                <button
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                                >
                                    Coming Soon
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminTools;
