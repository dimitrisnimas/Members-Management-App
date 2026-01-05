import { useState, useEffect } from 'react';
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, Button, Chip, TextField, Box, IconButton, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';

const MembersList = () => {
    const [members, setMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const fetchMembers = async () => {
        try {
            const response = await api.get('/users');
            setMembers(response.data);
            setFilteredMembers(response.data);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    useEffect(() => {
        const filtered = members.filter(member =>
            member.first_name.toLowerCase().includes(search.toLowerCase()) ||
            member.last_name.toLowerCase().includes(search.toLowerCase()) ||
            member.email.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredMembers(filtered);
    }, [search, members]);

    const handleApprove = async (id) => {
        if (!window.confirm('Are you sure you want to approve this user?')) return;
        try {
            await api.post(`/users/${id}/approve`);
            fetchMembers();
        } catch (error) {
            console.error('Error approving user:', error);
        }
    };

    const handleDeny = async (id) => {
        if (!window.confirm('Are you sure you want to deny this user?')) return;
        try {
            await api.post(`/users/${id}/deny`);
            fetchMembers();
        } catch (error) {
            console.error('Error denying user:', error);
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Members Management</Typography>
                <TextField
                    size="small"
                    placeholder="Search members..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Registered</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredMembers.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>{member.first_name} {member.last_name}</TableCell>
                                <TableCell>{member.email}</TableCell>
                                <TableCell>{member.member_type}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={member.status}
                                        color={member.status === 'approved' ? 'success' : member.status === 'pending' ? 'warning' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{format(new Date(member.created_at), 'dd/MM/yyyy')}</TableCell>
                                <TableCell align="right">
                                    {member.status === 'pending' && (
                                        <>
                                            <Tooltip title="Approve">
                                                <IconButton color="success" onClick={() => handleApprove(member.id)}>
                                                    <CheckCircleIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Deny">
                                                <IconButton color="error" onClick={() => handleDeny(member.id)}>
                                                    <CancelIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    )}
                                    <Tooltip title="View Details">
                                        <IconButton color="primary" onClick={() => navigate(`/admin/members/${member.id}`)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default MembersList;
