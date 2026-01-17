import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { employeeAPI } from '../api';
import EmployeeDetailModal from '../components/EmployeeDetailModal';

const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Product', 'IT'];

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    department: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [loadingNextId, setLoadingNextId] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAll();
      setEmployees(response.data);
    } catch (err) {
      showNotification('Failed to load employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchNextId = async () => {
    try {
      setLoadingNextId(true);
      const response = await employeeAPI.getNextId();
      setFormData(prev => ({ ...prev, employee_id: response.data.next_id }));
    } catch (err) {
      console.error('Failed to fetch next ID:', err);
    } finally {
      setLoadingNextId(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.employee_id.trim()) {
      errors.employee_id = 'Employee ID is required';
    }
    if (!formData.full_name.trim()) errors.full_name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.department) errors.department = 'Department is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await employeeAPI.create(formData);
      showNotification('Employee added successfully!');
      setShowModal(false);
      setFormData({ employee_id: '', full_name: '', email: '', department: '' });
      setFormErrors({});
      fetchEmployees();
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to add employee';
      showNotification(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await employeeAPI.delete(deleteConfirm.employee_id);
      showNotification('Employee deleted successfully!');
      setDeleteConfirm(null);
      fetchEmployees();
    } catch (err) {
      showNotification('Failed to delete employee', 'error');
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    fetchNextId();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ employee_id: '', full_name: '', email: '', department: '' });
    setFormErrors({});
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box>
      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
            Employees
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your workforce • {employees.length} employees
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          {employees.length > 0 && (
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  border: '1px solid',
                  borderColor: 'divider',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                },
              }}
            >
              <ToggleButton value="grid">
                <Tooltip title="Grid View">
                  <GridViewIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="list">
                <Tooltip title="List View">
                  <ViewListIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            size="large"
            sx={{ px: 3 }}
          >
            Add Employee
          </Button>
        </Box>
      </Box>

      {/* Empty State */}
      {employees.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.primary" gutterBottom>
            No employees yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Start building your team by adding your first employee
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
          >
            Add Your First Employee
          </Button>
        </Paper>
      )}

      {/* Employee Grid View */}
      {employees.length > 0 && viewMode === 'grid' && (
        <Grid container spacing={3}>
          {employees.map((employee) => (
            <Grid item xs={12} sm={6} lg={4} key={employee.id}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(20, 184, 166, 0.12)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Avatar
                      onClick={() => setSelectedEmployee(employee)}
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: 'primary.main',
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.05)' },
                      }}
                    >
                      {employee.full_name.charAt(0).toUpperCase()}
                    </Avatar>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteConfirm(employee)}
                      sx={{
                        color: 'text.disabled',
                        '&:hover': { color: 'error.main', bgcolor: 'rgba(239, 68, 68, 0.1)' },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color="text.primary"
                    onClick={() => setSelectedEmployee(employee)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' },
                      transition: 'color 0.2s',
                      mb: 0.5,
                    }}
                  >
                    {employee.full_name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1} mb={2}>
                    <EmailIcon fontSize="small" />
                    {employee.email}
                  </Typography>

                  <Box display="flex" gap={1} mb={3}>
                    <Chip
                      icon={<BadgeIcon />}
                      label={employee.employee_id}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: 'divider' }}
                    />
                    <Chip
                      icon={<BusinessIcon />}
                      label={employee.department}
                      size="small"
                      sx={{ bgcolor: 'rgba(20, 184, 166, 0.1)', color: 'primary.main' }}
                    />
                  </Box>

                  <Box
                    display="flex"
                    gap={3}
                    pt={2}
                    borderTop="1px solid"
                    sx={{ borderColor: 'divider' }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        Present: <Box component="span" fontWeight={600} color="success.main">{employee.total_present || 0}</Box>
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CancelIcon fontSize="small" sx={{ color: 'error.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        Absent: <Box component="span" fontWeight={600} color="error.main">{employee.total_absent || 0}</Box>
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Employee List View */}
      {employees.length > 0 && viewMode === 'list' && (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Employee ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Present</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Absent</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow
                  key={employee.id}
                  hover
                  sx={{
                    '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.04)' },
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: 'primary.main',
                          fontSize: '1rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        {employee.full_name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography
                        variant="body1"
                        fontWeight={500}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' },
                        }}
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        {employee.full_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={employee.employee_id}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: 'divider', fontFamily: 'monospace' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {employee.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={employee.department}
                      size="small"
                      sx={{ bgcolor: 'rgba(20, 184, 166, 0.1)', color: 'primary.main' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={employee.total_present || 0}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<CancelIcon />}
                      label={employee.total_absent || 0}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Delete Employee">
                      <IconButton
                        size="small"
                        onClick={() => setDeleteConfirm(employee)}
                        sx={{
                          color: 'text.disabled',
                          '&:hover': { color: 'error.main', bgcolor: 'rgba(239, 68, 68, 0.1)' },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Employee Dialog */}
      <Dialog
        open={showModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { bgcolor: 'background.paper' },
        }}
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={600}>Add New Employee</Typography>
          <Typography variant="body2" color="text.secondary">
            Fill in the employee details below
          </Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={3}>
              <TextField
                label="Employee ID"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                error={!!formErrors.employee_id}
                helperText={formErrors.employee_id || 'Auto-generated ID'}
                fullWidth
                placeholder="EMP-0001"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: loadingNextId && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                error={!!formErrors.full_name}
                helperText={formErrors.full_name}
                fullWidth
                placeholder="John Doe"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={!!formErrors.email}
                helperText={formErrors.email}
                fullWidth
                placeholder="john@company.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl fullWidth error={!!formErrors.department}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  label="Department"
                  startAdornment={
                    <InputAdornment position="start">
                      <BusinessIcon color="action" />
                    </InputAdornment>
                  }
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
                {formErrors.department && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {formErrors.department}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={handleCloseModal} color="inherit" size="large">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={submitting && <CircularProgress size={20} color="inherit" />}
            >
              {submitting ? 'Adding...' : 'Add Employee'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>Delete Employee?</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to delete{' '}
            <Box component="span" fontWeight={600} color="text.primary">
              {deleteConfirm?.full_name}
            </Box>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteConfirm(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Employees;
