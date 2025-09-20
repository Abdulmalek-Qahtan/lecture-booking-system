import { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel, Alert, Grid, List, ListItem, ListItemText, Chip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- واجهة الأدمن ---
function AdminView({ user, stats, recentBookings }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'معتمد';
      case 'rejected':
        return 'مرفوض';
      case 'pending':
        return 'معلق';
      default:
        return status;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4">لوحة تحكم الأدمن</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Statistics Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          style={{ width: '100%' }}
        >
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {stats.totalUsers || 0}
                </Typography>
                <Typography variant="body2">إجمالي المستخدمين</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <MeetingRoomIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {stats.totalHalls || 0}
                </Typography>
                <Typography variant="body2">إجمالي القاعات</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                <PendingActionsIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {stats.pendingBookings || 0}
                </Typography>
                <Typography variant="body2">طلبات معلقة</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {stats.approvedBookings || 0}
                </Typography>
                <Typography variant="body2">حجوزات معتمدة</Typography>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>

        {/* Recent Bookings Section */}
        <Grid item xs={12}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
          >
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                آخر طلبات الحجز
              </Typography>
              {recentBookings.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  لا توجد طلبات حجز حديثة
                </Typography>
              ) : (
                <List>
                  {recentBookings.map((booking) => (
                    <ListItem key={booking._id} divider>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body1">
                              طلب من <strong>{booking.user?.username || 'غير محدد'}</strong> لقاعة <strong>{booking.hall?.name || 'غير محدد'}</strong>
                            </Typography>
                            <Chip 
                              label={getStatusLabel(booking.status)} 
                              color={getStatusColor(booking.status)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>الموضوع:</strong> {booking.subject || 'غير محدد'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>التاريخ:</strong> {new Date(booking.date).toLocaleDateString('ar-SA')} | <strong>الوقت:</strong> {booking.startTime} - {booking.endTime}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
}

// --- واجهة الدكتور ---
function DoctorView({ user, halls }) {
  const [selectedHall, setSelectedHall] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [message, setMessage] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('');
  const [level, setLevel] = useState('');

  const handleRequestSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hall: selectedHall, 
          user: user.id, 
          date: selectedDate, 
          startTime, 
          endTime, 
          subject, 
          department, 
          level 
        }),
      });
      if (response.ok) {
        setMessage('تم إرسال طلبك بنجاح وسوف تتم مراجعته.');
      } else {
        setMessage('حدث خطأ أثناء إرسال الطلب.');
      }
    } catch (err) {
      setMessage('فشل الاتصال بالخادم.');
    }
  };

  return (
    <Container maxWidth="md">
      <Box mb={4}><Typography variant="h4">لوحة تحكم الدكتور</Typography></Box>
      <Box component={Paper} p={3}>
        <Typography variant="h5" component="h2" gutterBottom>تقديم طلب حجز قاعة</Typography>
        <Box component="form" onSubmit={handleRequestSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl fullWidth required>
            <InputLabel>اختر القاعة</InputLabel>
            <Select value={selectedHall} label="اختر القاعة" onChange={(e) => setSelectedHall(e.target.value)}>
              {halls.map((hall) => (
                <MenuItem key={hall._id} value={hall._id}>{hall.name} (السعة: {hall.capacity})</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField label="الموضوع" value={subject} onChange={(e) => setSubject(e.target.value)} required fullWidth />

          <TextField label="القسم" value={department} onChange={(e) => setDepartment(e.target.value)} required fullWidth />

          <TextField label="المستوى" value={level} onChange={(e) => setLevel(e.target.value)} required fullWidth />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker label="اختر التاريخ" value={selectedDate} onChange={(newValue) => setSelectedDate(newValue)} renderInput={(params) => <TextField {...params} />} />
          </LocalizationProvider>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="وقت البدء" type="time" required InputLabelProps={{ shrink: true }} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <TextField label="وقت الانتهاء" type="time" required InputLabelProps={{ shrink: true }} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </Box>

          {message && <Alert severity={message.includes('نجاح') ? 'success' : 'error'} sx={{ mt: 2 }}>{message}</Alert>}
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>إرسال الطلب</Button>
        </Box>
      </Box>
    </Container>
  );
}

// --- واجهة الطالب ---
const StudentView = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/public/bookings`);
        if (response.ok) {
          const data = await response.json();
          setBookings(data);
        }
      } catch (error) {
        console.error('فشل في جلب الحجوزات:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
          جاري تحميل الجدول...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          الجدول العام للحجوزات
        </Typography>
        <Typography variant="body1" color="text.secondary">
          عرض جميع الحجوزات المعتمدة
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>القاعة</TableCell>
              <TableCell>المادة</TableCell>
              <TableCell>الدكتور</TableCell>
              <TableCell>التاريخ</TableCell>
              <TableCell>الوقت</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    لا توجد حجوزات معتمدة متاحة حاليًا
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>{booking.hall?.name || 'غير محدد'}</TableCell>
                  <TableCell>{booking.subject || 'غير محدد'}</TableCell>
                  <TableCell>{booking.user?.username || 'غير محدد'}</TableCell>
                  <TableCell>{new Date(booking.date).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>{`${booking.startTime || '-'} - ${booking.endTime || '-'}`}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

// --- المكون الرئيسي الذي يختار الواجهة ---
function Dashboard({ user }) {
  // State for stats, halls, and recent bookings
  const [halls, setHalls] = useState([]);
  const [stats, setStats] = useState({});
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    fetchHalls();
    if (user?.role === 'admin') {
      fetchStats();
      fetchRecentBookings();
    }
  }, [user]);

  const fetchHalls = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/halls`);
      const data = await response.json();
      setHalls(data);
    } catch (error) {
      console.error('فشل في جلب البيانات:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/stats/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('فشل في جلب الإحصائيات:', error);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/bookings/recent`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRecentBookings(data);
      }
    } catch (error) {
      console.error('فشل في جلب آخر طلبات الحجز:', error);
    }
  };


  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return (
        <AdminView
          user={user}
          stats={stats}
          recentBookings={recentBookings}
        />
      );
    case 'doctor':
      return <DoctorView user={user} halls={halls} />;
    case 'student':
      return <StudentView />;
    default:
      return <Typography>دور غير معروف</Typography>;
  }
}

export default Dashboard;
