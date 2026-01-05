import { Paper, Typography, List, ListItem, ListItemText, ListItemIcon, Button, Box } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import DownloadIcon from '@mui/icons-material/Download';
import { format } from 'date-fns';
import api from '../services/api';

const ActionHistory = ({ history, userId, showExport = true }) => {

    const handleExport = async () => {
        try {
            const response = await api.get(`/export/user/${userId}/history`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `user_history_${userId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export history');
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    Action History
                </Typography>
                {showExport && (
                    <Button
                        startIcon={<DownloadIcon />}
                        variant="outlined"
                        size="small"
                        onClick={handleExport}
                    >
                        Export PDF
                    </Button>
                )}
            </Box>

            <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                {history && history.length > 0 ? (
                    history.map((action) => (
                        <ListItem key={action.id}>
                            <ListItemIcon>
                                <HistoryIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary={action.action_description}
                                secondary={`${format(new Date(action.created_at), 'dd/MM/yyyy HH:mm')} - ${action.action_type}`}
                            />
                        </ListItem>
                    ))
                ) : (
                    <ListItem>
                        <ListItemText primary="No history available" />
                    </ListItem>
                )}
            </List>
        </Paper>
    );
};

export default ActionHistory;
