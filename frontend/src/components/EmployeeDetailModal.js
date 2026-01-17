import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Avatar,
  IconButton,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { format } from 'date-fns';
import { attendanceAPI } from '../api';

function EmployeeDetailModal({ employee, onClose }) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const response = await attendanceAPI.getByEmployee(employee.employee_id);
        setAttendance(response.data);
      } catch (err) {
        console.error('Failed to fetch attendance:', err);
      } finally {
        setLoading(false);
      }
    };

    if (employee) {
      fetchAttendance();
    }
  }, [employee]);

  if (!employee) return null;

  const presentDays = attendance.filter(a => a.status === 'Present').length;
  const absentDays = attendance.filter(a => a.status === 'Absent').length;
  const attendanceRate = attendance.length > 0 
    ? ((presentDays / attendance.length) * 100).toFixed(1) 
    : 0;

  return (
    <Dialog
      open={!!employee}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { bgcolor: 'background.paper', maxHeight: '90vh' },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" gap={3} alignItems="center">
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                fontWeight: 700,
              }}
            >
              {employee.full_name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                {employee.full_name}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {employee.email}
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* Info Cards */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6}>
            <Paper
              elevation={0}
              sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <BadgeIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Employee ID
                </Typography>
              </Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {employee.employee_id}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper
              elevation={0}
              sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <BusinessIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Department
                </Typography>
              </Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {employee.department}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Stats */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'success.main',
                bgcolor: 'rgba(16, 185, 129, 0.08)',
              }}
            >
              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 32, mb: 1 }} />
              <Typography variant="h4" fontWeight={700} color="success.main">
                {presentDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days Present
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'error.main',
                bgcolor: 'rgba(239, 68, 68, 0.08)',
              }}
            >
              <CancelIcon sx={{ color: 'error.main', fontSize: 32, mb: 1 }} />
              <Typography variant="h4" fontWeight={700} color="error.main">
                {absentDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days Absent
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'primary.main',
                bgcolor: 'rgba(20, 184, 166, 0.08)',
              }}
            >
              <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 32, mb: 1 }} />
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {attendanceRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Attendance Rate
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Attendance History */}
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <EventIcon color="action" />
            <Typography variant="h6" fontWeight={600}>
              Attendance History
            </Typography>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={32} />
            </Box>
          ) : attendance.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <EventIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">
                No attendance records found
              </Typography>
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                maxHeight: 300,
                overflow: 'auto',
              }}
            >
              <List disablePadding>
                {attendance.map((record, index) => (
                  <Box key={record.id}>
                    <ListItem sx={{ py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {record.status === 'Present' ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CancelIcon color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={format(new Date(record.date), 'EEEE, MMMM d, yyyy')}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <Chip
                        label={record.status}
                        size="small"
                        color={record.status === 'Present' ? 'success' : 'error'}
                        sx={{ fontWeight: 500 }}
                      />
                    </ListItem>
                    {index < attendance.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default EmployeeDetailModal;
