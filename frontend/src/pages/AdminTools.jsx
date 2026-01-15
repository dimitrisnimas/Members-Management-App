import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow,
    Box, Typography, Radio, RadioGroup, FormControlLabel, Alert, Chip
} from '@mui/material';

const AdminTools = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Duplicate Detection State
    const [scanning, setScanning] = useState(false);
    const [openDuplicateModal, setOpenDuplicateModal] = useState(false);
    const [duplicates, setDuplicates] = useState({ emails: [], names: [], idNumbers: [] });
    const [userDetails, setUserDetails] = useState({});
    const [tabValue, setTabValue] = useState(0);
    const [selectedMergeGroup, setSelectedMergeGroup] = useState(null);
    const [mergeTargetId, setMergeTargetId] = useState('');
    const [merging, setMerging] = useState(false);

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

    const scanForDuplicates = async () => {
        try {
            setScanning(true);
            const response = await api.get('/users/find-duplicates');
            setDuplicates(response.data.duplicates);
            setUserDetails(response.data.userDetails);
            setOpenDuplicateModal(true);
            setResult({
                type: 'success',
                message: `Scan complete: Found ${response.data.summary.totalAffectedUsers} potential duplicates.`
            });
        } catch (error) {
            setResult({
                type: 'error',
                message: 'Failed to scan for duplicates'
            });
        } finally {
            setScanning(false);
        }
    };

    const handleMerge = async () => {
        if (!mergeTargetId || !selectedMergeGroup) return;

        try {
            setMerging(true);
            const sourceIds = selectedMergeGroup.userIds.filter(id => id !== parseInt(mergeTargetId));

            // Merge each source user into target
            for (const sourceId of sourceIds) {
                await api.post('/users/merge', {
                    targetUserId: parseInt(mergeTargetId),
                    sourceUserId: sourceId
                });
            }

            // Refresh duplicates list
            await scanForDuplicates();
            setSelectedMergeGroup(null);
            setMergeTargetId('');
            setResult({
                type: 'success',
                message: 'Users merged successfully'
            });
        } catch (error) {
            console.error('Merge error:', error);
            // Don't close modal, just show error
            alert('Error merging users: ' + (error.response?.data?.message || error.message));
        } finally {
            setMerging(false);
        }
    };

    const renderDuplicateTable = (items, type) => {
        if (!items || items.length === 0) return <Typography sx={{ p: 2 }}>No duplicates found.</Typography>;

        return (
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Duplicate Value</TableCell>
                        <TableCell>Count</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{item.value}</TableCell>
                            <TableCell>{item.count}</TableCell>
                            <TableCell>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => setSelectedMergeGroup({ ...item, type })}
                                >
                                    Review & Merge
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    const renderMergePreview = () => {
        if (!selectedMergeGroup) return null;

        const users = selectedMergeGroup.userIds.map(id => userDetails[id]).filter(Boolean);

        return (
            <Box>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Select the primary account to keep. All other accounts will be merged into this one and then deleted.
                    Subscriptions and payments will be transferred.
                </Alert>

                <RadioGroup
                    value={mergeTargetId}
                    onChange={(e) => setMergeTargetId(e.target.value)}
                >
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Select</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Joined</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map(user => (
                                <TableRow key={user.id} selected={mergeTargetId === String(user.id)}>
                                    <TableCell>
                                        <FormControlLabel
                                            value={String(user.id)}
                                            control={<Radio />}
                                            label=""
                                        />
                                    </TableCell>
                                    <TableCell>{user.first_name} {user.last_name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.member_type}</TableCell>
                                    <TableCell>{user.status}</TableCell>
                                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </RadioGroup>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button onClick={() => setSelectedMergeGroup(null)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleMerge}
                        disabled={!mergeTargetId || merging}
                    >
                        {merging ? 'Merging...' : 'Merge All into Priority'}
                    </Button>
                </Box>
            </Box>
        );
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

                    {/* Duplicate Detection */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-start space-x-4">
                            <div className="bg-red-100 rounded-lg p-3">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Duplicate Detection
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Scan database for users with duplicate emails, names, or ID numbers. Merge duplicate profiles.
                                </p>
                                <button
                                    onClick={scanForDuplicates}
                                    disabled={scanning}
                                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {scanning ? 'Scanning...' : 'Scan for Duplicates'}
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
                                    Clean up old logs and temporary data (Coming Soon).
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
                                    System Info
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ver:</span>
                                        <span className="font-medium text-gray-900">2.0.0</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">DB:</span>
                                        <span className="font-medium text-gray-900">PostgreSQL</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Duplicate Detection Modal */}
            <Dialog
                open={openDuplicateModal}
                onClose={() => setOpenDuplicateModal(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Duplicate Detection Results</DialogTitle>
                <DialogContent>
                    {!selectedMergeGroup ? (
                        <>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
                                    <Tab label={`Emails (${duplicates.emails.length})`} />
                                    <Tab label={`Names (${duplicates.names.length})`} />
                                    <Tab label={`ID Numbers (${duplicates.idNumbers.length})`} />
                                </Tabs>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                {tabValue === 0 && renderDuplicateTable(duplicates.emails, 'email')}
                                {tabValue === 1 && renderDuplicateTable(duplicates.names, 'name')}
                                {tabValue === 2 && renderDuplicateTable(duplicates.idNumbers, 'id_number')}
                            </Box>
                        </>
                    ) : (
                        renderMergePreview()
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDuplicateModal(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
};

export default AdminTools;
