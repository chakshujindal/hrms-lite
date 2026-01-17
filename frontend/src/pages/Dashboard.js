import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Button,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { dashboardAPI } from '../api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (err) {
      setError('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
        <Typography color="error" gutterBottom>{error}</Typography>
        <Button variant="outlined" onClick={fetchStats}>Try Again</Button>
      </Paper>
    );
  }

  const statCards = [
    {
      label: 'Total Employees',
      value: stats?.total_employees || 0,
      icon: <PeopleIcon sx={{ fontSize: 32 }} />,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)',
    },
    {
      label: 'Present Today',
      value: stats?.total_present_today || 0,
      icon: <CheckCircleIcon sx={{ fontSize: 32 }} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      label: 'Absent Today',
      value: stats?.total_absent_today || 0,
      icon: <CancelIcon sx={{ fontSize: 32 }} />,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
    },
    {
      label: 'Attendance Rate',
      value: `${stats?.attendance_rate || 0}%`,
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's your workforce overview.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} mb={4}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.label}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: card.color,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  backgroundColor: card.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color,
                  mb: 2,
                }}
              >
                {card.icon}
              </Box>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                {card.label}
              </Typography>
              <Typography variant="h3" fontWeight={700} color="text.primary">
                {card.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          mb: 4,
        }}
      >
        <Typography variant="h6" fontWeight={600} color="text.primary" mb={3}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper
              component={Link}
              to="/employees"
              elevation={0}
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                textDecoration: 'none',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(20, 184, 166, 0.04)',
                  '& .arrow-icon': {
                    transform: 'translateX(4px)',
                  },
                },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'rgba(20, 184, 166, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main',
                }}
              >
                <GroupAddIcon />
              </Box>
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                  Manage Employees
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add, view, or remove employees
                </Typography>
              </Box>
              <ArrowForwardIcon
                className="arrow-icon"
                sx={{ color: 'text.disabled', transition: 'transform 0.2s' }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              component={Link}
              to="/attendance"
              elevation={0}
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                textDecoration: 'none',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'secondary.main',
                  bgcolor: 'rgba(99, 102, 241, 0.04)',
                  '& .arrow-icon': {
                    transform: 'translateX(4px)',
                  },
                },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'secondary.main',
                }}
              >
                <EventAvailableIcon />
              </Box>
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                  Mark Attendance
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Record daily attendance
                </Typography>
              </Box>
              <ArrowForwardIcon
                className="arrow-icon"
                sx={{ color: 'text.disabled', transition: 'transform 0.2s' }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Today's Summary */}
      {stats && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: 'primary.main',
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h6" fontWeight={600} color="text.primary">
                Today's Summary
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="h3" fontWeight={700} color="primary.main">
                {stats.attendance_rate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Attendance Rate
              </Typography>
            </Box>
          </Box>

          <Box display="flex" gap={4} mt={3} pt={3} borderTop="1px solid" sx={{ borderColor: 'divider' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main' }} />
              <Typography color="text.secondary">
                {stats.total_present_today} Present
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'error.main' }} />
              <Typography color="text.secondary">
                {stats.total_absent_today} Absent
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'text.disabled' }} />
              <Typography color="text.secondary">
                {stats.total_employees - stats.total_present_today - stats.total_absent_today} Pending
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default Dashboard;
