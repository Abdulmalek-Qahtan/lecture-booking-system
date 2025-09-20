import { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function RegisterPage({ onShowLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage("تم إنشاء الحساب بنجاح! يمكنك الآن العودة لتسجيل الدخول.");
      } else {
        setError(data.message || 'حدث خطأ غير متوقع');
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5">
            إنشاء حساب جديد
          </Typography>
          <Box component="form" onSubmit={handleRegister} sx={{ mt: 3 }}>
            <TextField margin="normal" required fullWidth label="اسم المستخدم" value={username} onChange={(e) => setUsername(e.target.value)} />
            <TextField margin="normal" required fullWidth label="كلمة المرور" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <FormControl fullWidth margin="normal">
              <InputLabel>نوع الحساب</InputLabel>
              <Select value={role} label="نوع الحساب" onChange={(e) => setRole(e.target.value)}>
                <MenuItem value="admin">أدمن</MenuItem>
                <MenuItem value="doctor">دكتور</MenuItem>
                <MenuItem value="student">طالب</MenuItem>
              </Select>
            </FormControl>
            {message && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 1 }}>
              إنشاء الحساب
            </Button>
            <Button fullWidth onClick={onShowLogin}>
              العودة لتسجيل الدخول
            </Button>
          </Box>
        </Box>
      </motion.div>
    </Container>
  );
}

export default RegisterPage;