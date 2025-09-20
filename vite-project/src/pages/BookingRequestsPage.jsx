import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Box,
  Alert
} from '@mui/material';
import { CheckCircle as ApproveIcon, Cancel as RejectIcon } from '@mui/icons-material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function BookingRequestsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
        setError('');
      } else {
        setError('فشل في جلب طلبات الحجز');
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update the booking in the local state
        setBookings(prevBookings =>
          prevBookings.map(booking =>
            booking._id === bookingId
              ? { ...booking, status: newStatus }
              : booking
          )
        );
        setMessage(`تم ${newStatus === 'approved' ? 'الموافقة على' : 'رفض'} طلب الحجز بنجاح`);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'فشل في تحديث حالة الطلب');
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم');
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { label: 'في الانتظار', color: 'warning' },
      approved: { label: 'موافق عليه', color: 'success' },
      rejected: { label: 'مرفوض', color: 'error' }
    };
    
    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
          جاري تحميل طلبات الحجز...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          طلبات الحجز
        </Typography>
        <Typography variant="body1" color="text.secondary">
          إدارة طلبات حجز القاعات
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {message && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>اسم القاعة</TableCell>
              <TableCell>المستخدم</TableCell>
              <TableCell>المادة</TableCell>
              <TableCell>التاريخ</TableCell>
              <TableCell>الوقت</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell align="center">الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    لا توجد طلبات حجز
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>{booking.hall?.name || 'غير محدد'}</TableCell>
                  <TableCell>{booking.user?.username || 'غير محدد'}</TableCell>
                  <TableCell>{booking.subject || 'غير محدد'}</TableCell>
                  <TableCell>{new Date(booking.date).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>{`${booking.startTime || '-'} - ${booking.endTime || '-'}`}</TableCell>
                  <TableCell>{getStatusChip(booking.status)}</TableCell>
                  <TableCell align="center">
                    {booking.status === 'pending' && (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<ApproveIcon />}
                          onClick={() => handleUpdateStatus(booking._id, 'approved')}
                        >
                          موافقة
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          startIcon={<RejectIcon />}
                          onClick={() => handleUpdateStatus(booking._id, 'rejected')}
                        >
                          رفض
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default BookingRequestsPage;
