import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Alert, Grid, Link } from '@mui/material';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    try {
      console.log('[FRONTEND] Sending login request...'); // <-- كاشف 1
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      console.log('[FRONTEND] Received response from server:', data); // <-- كاشف 2

      if (data.success) {
        console.log('[FRONTEND] Login successful. Saving token and calling onLoginSuccess...'); // <-- كاشف 3
        localStorage.setItem('authToken', data.token);
        onLoginSuccess();
      } else {
        console.log('[FRONTEND] Login failed. Server message:', data.message); // <-- كاشف 4
        setError(data.message);
      }
    } catch (err) {
      console.error('[FRONTEND] An error occurred:', err); // <-- كاشف 5
      setError('فشل الاتصال بالخادم');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5">
            تسجيل الدخول
          </Typography>
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="اسم المستخدم"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="كلمة المرور"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <Alert severity="error" sx={{ width: '100%', mt: 1 }}>{error}</Alert>}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              دخول
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/register" variant="body2">
                  ليس لديك حساب؟ قم بإنشاء حساب
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </motion.div>
    </Container>
  );
}

export default LoginPage;