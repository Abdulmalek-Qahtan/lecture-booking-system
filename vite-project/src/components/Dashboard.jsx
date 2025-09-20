import { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Select, MenuItem, FormControl, InputLabel, Alert, Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PeopleIcon from '@mui/icons-material/People';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion, AnimatePresence } from 'framer-motion';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- واجهة الأدمن ---
function AdminView({
  user,
  halls,
  stats,
  newHallName,
  setNewHallName,
  newHallCapacity,
  setNewHallCapacity,
  editingHallId,
  setEditingHallId,
  updatedHallData,
  setUpdatedHallData,
  handleAddHall,
  handleDeleteHall,
  handleEditClick,
  handleUpdateHall,
}) {
  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4">لوحة تحكم الأدمن</Typography>
      </Box>

      {/* Statistics Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Box component={Paper} p={3} mb={4}>
          <Typography variant="h5" component="h2" gutterBottom>إدارة القاعات</Typography>
          <Box component="form" onSubmit={handleAddHall} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField label="اسم القاعة" value={newHallName} onChange={(e) => setNewHallName(e.target.value)} required />
            <TextField label="سعة القاعة" type="number" value={newHallCapacity} onChange={(e) => setNewHallCapacity(e.target.value)} required />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button type="submit" variant="contained">إضافة</Button>
            </motion.div>
          </Box>
        </Box>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>اسم القاعة</TableCell>
                <TableCell align="right">السعة</TableCell>
                <TableCell align="center">إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {halls.map((hall) => (
                  <motion.tr key={hall._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}>
                    {editingHallId === hall._id ? (
                      <>
                        <TableCell>
                          <TextField size="small" variant="standard" value={updatedHallData.name} onChange={(e) => setUpdatedHallData({ ...updatedHallData, name: e.target.value })} />
                        </TableCell>
                        <TableCell align="right">
                          <TextField size="small" variant="standard" type="number" value={updatedHallData.capacity} onChange={(e) => setUpdatedHallData({ ...updatedHallData, capacity: e.target.value })} />
                        </TableCell>
                        <TableCell align="center"><IconButton onClick={() => handleUpdateHall(hall._id)} color="primary"><SaveIcon /></IconButton></TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{hall.name}</TableCell>
                        <TableCell align="right">{hall.capacity}</TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => handleEditClick(hall)}><EditIcon /></IconButton>
                          <IconButton onClick={() => handleDeleteHall(hall._id)} color="error"><DeleteIcon /></IconButton>
                        </TableCell>
                      </>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>
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

  const handleRequestSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hall: selectedHall, user: user.id, date: selectedDate, startTime, endTime, subject }),
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
  // Lifted state for halls and admin form/editing
  const [halls, setHalls] = useState([]);
  const [stats, setStats] = useState({});
  const [newHallName, setNewHallName] = useState('');
  const [newHallCapacity, setNewHallCapacity] = useState('');
  const [editingHallId, setEditingHallId] = useState(null);
  const [updatedHallData, setUpdatedHallData] = useState({ name: '', capacity: '' });

  useEffect(() => {
    fetchHalls();
    if (user?.role === 'admin') {
      fetchStats();
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

  const handleAddHall = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/halls`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newHallName, capacity: newHallCapacity }),
      });
      const addedHall = await response.json();
      setHalls(prev => [...prev, addedHall]);
      setNewHallName('');
      setNewHallCapacity('');
    } catch (error) {
      console.error('فشل في إضافة القاعة:', error);
    }
  };

  const handleDeleteHall = async (hallIdToDelete) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${API_BASE_URL}/api/halls/${hallIdToDelete}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setHalls(prev => prev.filter(hall => hall._id !== hallIdToDelete));
    } catch (error) {
      console.error('فشل في حذف القاعة:', error);
    }
  };

  const handleEditClick = (hall) => {
    setEditingHallId(hall._id);
    setUpdatedHallData({ name: hall.name, capacity: hall.capacity });
  };

  const handleUpdateHall = async (hallId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/halls/${hallId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedHallData),
      });
      const updatedHall = await response.json();
      setHalls(prev => prev.map(hall => (hall._id === hallId ? updatedHall : hall)));
      setEditingHallId(null);
    } catch (error) {
      console.error('فشل في تحديث القاعة:', error);
    }
  };

  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return (
        <AdminView
          user={user}
          halls={halls}
          stats={stats}
          newHallName={newHallName}
          setNewHallName={setNewHallName}
          newHallCapacity={newHallCapacity}
          setNewHallCapacity={setNewHallCapacity}
          editingHallId={editingHallId}
          setEditingHallId={setEditingHallId}
          updatedHallData={updatedHallData}
          setUpdatedHallData={setUpdatedHallData}
          handleAddHall={handleAddHall}
          handleDeleteHall={handleDeleteHall}
          handleEditClick={handleEditClick}
          handleUpdateHall={handleUpdateHall}
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
