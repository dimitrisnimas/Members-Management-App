import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';

const ExpiringMembers = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpiringMembers();
    }, []);

    const fetchExpiringMembers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users/expiring');
            setMembers(response.data);
        } catch (error) {
            console.error('Error fetching expiring members:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysLeftBadge = (daysLeft) => {
        if (daysLeft <= 0) {
            return <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-700 font-medium">Expired</span>;
        }
        if (daysLeft <= 7) {
            return <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-700 font-medium">{daysLeft} days</span>;
        }
        if (daysLeft <= 15) {
            return <span className="px-3 py-1 text-sm rounded-full bg-orange-100 text-orange-700 font-medium">{daysLeft} days</span>;
        }
        return <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700 font-medium">{daysLeft} days</span>;
    };

    return (
        <DashboardLayout>
            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Expiring Members</h1>
                    <p className="text-gray-600 mt-1">Members whose subscriptions expire within 30 days</p>
                </div>

                {/* Summary Card */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg p-6 mb-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Total Expiring Soon</p>
                            <p className="text-4xl font-bold mt-1">{members.length}</p>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-full p-4">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Members Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Member
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Registration Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Expiration Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Days Left
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : members.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center">
                                            <div className="text-gray-400">
                                                <svg className="mx-auto h-12 w-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-lg font-medium">No expiring members</p>
                                                <p className="text-sm">All memberships are up to date!</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    members.map((member) => {
                                        const registrationDate = new Date(member.created_at);
                                        const expirationDate = new Date(registrationDate);
                                        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
                                        const daysLeft = Math.ceil((expirationDate - new Date()) / (1000 * 60 * 60 * 24));

                                        return (
                                            <tr key={member.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {member.first_name} {member.last_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {member.fathers_name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{member.email}</div>
                                                    <div className="text-sm text-gray-500">{member.phone}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {registrationDate.toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {expirationDate.toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getDaysLeftBadge(daysLeft)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ExpiringMembers;
