import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  InputAdornment,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SearchIcon from '@mui/icons-material/Search';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { employeeAPI, attendanceAPI } from '../api';
import { format } from 'date-fns';
import EmployeeDetailModal from '../components/EmployeeDetailModal';

const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Product', 'IT'];

function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Initial load - fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await employeeAPI.getAll();
        setEmployees(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const [empRes, attRes] = await Promise.all([
        employeeAPI.getAll(),
        attendanceAPI.getAll({ start_date: dateStr, end_date: dateStr }),
      ]);
      
      setEmployees(empRes.data);
      setAttendance(attRes.data);
      setDataLoaded(true);
    } catch (err) {
      showNotification('Failed to load attendance data', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchAttendanceData();
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const getAttendanceStatus = (employeeDbId) => {
    const record = attendance.find((a) => a.employee_db_id === employeeDbId);
    return record?.status || null;
  };

  const markAttendance = async (employeeId, status) => {
    try {
      setSubmitting(employeeId);
      await attendanceAPI.mark({
        employee_id: employeeId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        status: status,
      });
      showNotification(`Marked as ${status}`, 'success');
      fetchAttendanceData();
    } catch (err) {
      showNotification('Failed to mark attendance', 'error');
    } finally {
      setSubmitting(null);
    }
  };

  const toggleAttendance = (employee) => {
    const currentStatus = getAttendanceStatus(employee.id);
    let newStatus;
    
    if (!currentStatus) {
      newStatus = 'Present';
    } else if (currentStatus === 'Present') {
      newStatus = 'Absent';
    } else {
      newStatus = 'Present';
    }
    
    markAttendance(employee.employee_id, newStatus);
  };

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = selectedDepartments.length === 0 || 
      selectedDepartments.length === departments.length || 
      selectedDepartments.includes(emp.department);
    const matchesSearch = searchQuery === '' || 
      emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const presentCount = attendance.filter((a) => a.status === 'Present').length;
  const absentCount = attendance.filter((a) => a.status === 'Absent').length;

  if (initialLoading) {
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
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
          Attendance
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Mark and track daily attendance for your employees
        </Typography>
      </Box>

      {/* Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
        }}
      >
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          gap={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
        >
          {/* Date Picker */}
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            slotProps={{
              textField: {
                sx: { minWidth: 180 },
                size: 'medium',
              },
            }}
          />

          {/* Department Multi-Select */}
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>Department</InputLabel>
            <Select
              multiple
              value={selectedDepartments}
              onChange={(e) => {
                const value = e.target.value;
                if (value.includes('all')) {
                  if (selectedDepartments.length === departments.length) {
                    setSelectedDepartments([]);
                  } else {
                    setSelectedDepartments([...departments]);
                  }
                } else {
                  setSelectedDepartments(value);
                }
              }}
              input={<OutlinedInput label="Department" />}
              renderValue={(selected) => 
                selected.length === 0 
                  ? 'All Departments' 
                  : selected.length === departments.length 
                    ? 'All Departments' 
                    : selected.join(', ')
              }
            >
              <MenuItem value="all">
                <Checkbox 
                  checked={selectedDepartments.length === departments.length} 
                  indeterminate={selectedDepartments.length > 0 && selectedDepartments.length < departments.length}
                  color="primary" 
                />
                <ListItemText primary="Select All" primaryTypographyProps={{ fontWeight: 600 }} />
              </MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  <Checkbox checked={selectedDepartments.indexOf(dept) > -1} color="primary" />
                  <ListItemText primary={dept} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Search Field */}
          <TextField
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* Search Button */}
          <Button
            variant="contained"
            size="large"
            onClick={handleSearch}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
            sx={{ px: 4, py: 1.5 }}
          >
            Search
          </Button>
        </Box>
      </Paper>

      {/* Stats Summary */}
      {dataLoaded && (
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Paper
            elevation={0}
            sx={{
              px: 3,
              py: 2,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">Date:</Typography>
            <Typography variant="body1" fontWeight={600} color="text.primary">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              px: 3,
              py: 2,
              border: '1px solid',
              borderColor: 'success.main',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
            }}
          >
            <Typography variant="body2" color="text.secondary">Present</Typography>
            <Typography variant="h6" fontWeight={700} color="success.main">{presentCount}</Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              px: 3,
              py: 2,
              border: '1px solid',
              borderColor: 'error.main',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
            }}
          >
            <Typography variant="body2" color="text.secondary">Absent</Typography>
            <Typography variant="h6" fontWeight={700} color="error.main">{absentCount}</Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              px: 3,
              py: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" color="text.secondary">Pending</Typography>
            <Typography variant="h6" fontWeight={700} color="text.secondary">
              {filteredEmployees.length - presentCount - absentCount}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Initial State */}
      {!dataLoaded && !loading && (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.primary" gutterBottom>
            Select a Date
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose a date and click "Search" to view and mark attendance
          </Typography>
        </Paper>
      )}

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {/* Attendance Table */}
      {dataLoaded && !loading && (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider' }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: '35%' }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '15%' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '15%' }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '15%' }} align="center">Status</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '20%' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No employees found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => {
                  const status = getAttendanceStatus(employee.id);
                  const isSubmitting = submitting === employee.employee_id;

                  return (
                    <TableRow key={employee.id} hover>
                      <TableCell>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={2}
                          sx={{ cursor: 'pointer' }}
                          onClick={() => setSelectedEmployee(employee)}
                        >
                          <Avatar
                            sx={{
                              bgcolor: 'primary.main',
                              width: 40,
                              height: 40,
                              fontWeight: 600,
                            }}
                          >
                            {employee.full_name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography
                            fontWeight={500}
                            color="text.primary"
                            sx={{
                              '&:hover': { color: 'primary.main' },
                              transition: 'color 0.2s',
                            }}
                          >
                            {employee.full_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {employee.employee_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={employee.department}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(20, 184, 166, 0.1)',
                            color: 'primary.main',
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {status === 'Present' && (
                          <Chip
                            icon={<HowToRegIcon />}
                            label="Present"
                            size="small"
                            color="success"
                            sx={{ fontWeight: 600, px: 1 }}
                          />
                        )}
                        {status === 'Absent' && (
                          <Chip
                            icon={<PersonOffIcon />}
                            label="Absent"
                            size="small"
                            color="error"
                            sx={{ fontWeight: 600, px: 1 }}
                          />
                        )}
                        {!status && (
                          <Chip
                            icon={<HelpOutlineIcon />}
                            label="Pending"
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 500, color: 'text.secondary' }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
                          <Tooltip title="Mark as Present">
                            <span>
                              <Button
                                size="small"
                                variant={status === 'Present' ? 'contained' : 'outlined'}
                                color="success"
                                onClick={() => markAttendance(employee.employee_id, 'Present')}
                                disabled={isSubmitting}
                                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <ThumbUpIcon />}
                                sx={{
                                  minWidth: 90,
                                  fontWeight: 600,
                                  textTransform: 'none',
                                }}
                              >
                                Present
                              </Button>
                            </span>
                          </Tooltip>
                          <Tooltip title="Mark as Absent">
                            <span>
                              <Button
                                size="small"
                                variant={status === 'Absent' ? 'contained' : 'outlined'}
                                color="error"
                                onClick={() => markAttendance(employee.employee_id, 'Absent')}
                                disabled={isSubmitting}
                                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <ThumbDownIcon />}
                                sx={{
                                  minWidth: 90,
                                  fontWeight: 600,
                                  textTransform: 'none',
                                }}
                              >
                                Absent
                              </Button>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Attendance;
