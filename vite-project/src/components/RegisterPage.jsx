import { useState } from 'react';
import { Link as RouterLink, Outlet, NavLink } from 'react-router-dom';
import { 
  Container, Box, Typography, TextField, Button, Alert, FormControl, InputLabel, Select, MenuItem, Link,
  AppBar, Toolbar, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText
} from '@mui/material';
import { Dashboard as DashboardIcon, People as PeopleIcon, MeetingRoom as MeetingRoomIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Layout Component
function Layout() {
  const drawerWidth = 240;

  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Users', icon: <PeopleIcon />, path: '/users' },
    { text: 'Halls', icon: <MeetingRoomIcon />, path: '/halls' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navigationItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  sx={{
                    '&.active': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                  }}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

function RegisterPage() {
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
            <Link component={RouterLink} to="/login" variant="body2" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
              العودة لتسجيل الدخول
            </Link>
          </Box>
        </Box>
      </motion.div>
    </Container>
  );
}

export default RegisterPage;
export { Layout };