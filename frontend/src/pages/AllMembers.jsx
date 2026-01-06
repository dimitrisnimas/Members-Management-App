import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import EditMemberModal from '../components/EditMemberModal';
import PaymentModal from '../components/PaymentModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import api from '../services/api';

const AllMembers = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        membershipType: '',
        status: ''
    });
    const [sortBy, setSortBy] = useState('first_name');
    const [sortOrder, setSortOrder] = useState('ASC');
    const [selectedMember, setSelectedMember] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, [searchTerm, filters, sortBy, sortOrder]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users', {
                params: {
                    search: searchTerm,
                    membershipType: filters.membershipType,
                    status: filters.status,
                    sortBy,
                    sortOrder
                }
            });
            setMembers(response.data);
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (member) => {
        setSelectedMember(member);
        setShowEditModal(true);
    };

    const handleAddPayment = (member) => {
        setSelectedMember(member);
        setShowPaymentModal(true);
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/users/${selectedMember.id}`);
            setShowDeleteConfirm(false);
            setSelectedMember(null);
            fetchMembers();
        } catch (error) {
            console.error('Error deleting member:', error);
        }
    };

    const calculateDaysLeft = (registrationDate, membershipType) => {
        if (membershipType !== 'Τακτικό') return 'N/A';
        const expiration = new Date(registrationDate);
        expiration.setFullYear(expiration.getFullYear() + 1);
        const today = new Date();
        const daysLeft = Math.ceil((expiration - today) / (1000 * 60 * 60 * 24));
        return Math.max(0, daysLeft);
    };

    const getStatusBadge = (daysLeft, membershipType) => {
        if (membershipType !== 'Τακτικό') {
            return <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">Supporter</span>;
        }
        if (daysLeft > 30) {
            return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Active</span>;
        }
        if (daysLeft > 0) {
            return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Expiring Soon</span>;
        }
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Expired</span>;
    };

    return (
        <DashboardLayout>
            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">All Members</h1>
                    <p className="text-gray-600 mt-1">Manage and view all organization members</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <input
                                type="text"
                                placeholder="Search by name, email, phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Membership Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Membership Type</label>
                            <select
                                value={filters.membershipType}
                                onChange={(e) => setFilters({ ...filters, membershipType: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Types</option>
                                <option value="Τακτικό">Τακτικό</option>
                                <option value="Υποστηρικτής">Υποστηρικτής</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="expiring">Expiring Soon</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Members Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => {
                                            setSortBy('first_name');
                                            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                                        }}>
                                        Name {sortBy === 'first_name' && (sortOrder === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phone
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => {
                                            setSortBy('member_type');
                                            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                                        }}>
                                        Type {sortBy === 'member_type' && (sortOrder === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Days Left
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : members.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                            No members found
                                        </td>
                                    </tr>
                                ) : (
                                    members.map((member) => {
                                        const daysLeft = calculateDaysLeft(member.created_at, member.member_type);
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {member.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {member.phone}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {member.member_type}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {daysLeft !== 'N/A' ? `${daysLeft} days` : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(daysLeft, member.member_type)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(member)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleAddPayment(member)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Payment
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedMember(member);
                                                            setShowDeleteConfirm(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modals will be added here */}
                {showEditModal && <EditMemberModal member={selectedMember} onClose={() => setShowEditModal(false)} onSave={fetchMembers} />}
                {showPaymentModal && <PaymentModal member={selectedMember} onClose={() => setShowPaymentModal(false)} onSave={fetchMembers} />}
                {showDeleteConfirm && (
                    <DeleteConfirmModal
                        member={selectedMember}
                        onConfirm={handleDelete}
                        onCancel={() => {
                            setShowDeleteConfirm(false);
                            setSelectedMember(null);
                        }}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default AllMembers;
