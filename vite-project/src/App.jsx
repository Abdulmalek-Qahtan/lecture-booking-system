import { useState, useMemo, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, NavLink } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Typography } from '@mui/material';

import Layout from './components/Layout.jsx';
import LoginPage from './components/LoginPage.jsx';
import RegisterPage from './components/RegisterPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import BookingRequestsPage from './pages/BookingRequestsPage.jsx';
import UsersPage from './pages/UsersPage.jsx'; // <-- استيراد الصفحة الحقيقية
import CalendarPage from './pages/CalendarPage.jsx';

// صفحة مؤقتة
const HallsPage = () => <Typography variant="h4">صفحة إدارة القاعات (موجودة في لوحة التحكم الرئيسية)</Typography>;

// مكون لحماية روابط الأدمن
const AdminRoute = ({ children, user }) => {
  if (user?.role === 'admin') {
    return children;
  }
  return <Navigate to="/" replace />;
};

function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('dark');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        if (decodedUser.exp * 1000 < Date.now()) {
          localStorage.removeItem('authToken');
          setUser(null);
        } else {
          setUser(decodedUser);
        }
      } catch (e) {
        localStorage.removeItem('authToken');
        setUser(null);
      }
    }
  }, []);

  const toggleColorMode = () => setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  
  const theme = useMemo(() => createTheme({
    direction: 'rtl',
    palette: {
      mode,
      ...(mode === 'light' ? { primary: { main: '#1DA1F2' }, background: { default: '#F5F8FA' }, text: { primary: '#14171A' } } : { primary: { main: '#1DA1F2' }, background: { default: '#15202B', paper: '#192734' }, text: { primary: '#FFFFFF' } }),
    },
    typography: { fontFamily: 'Cairo, sans-serif', button: { textTransform: 'none', fontWeight: 700 } },
  }), [mode]);

  const handleLoginSuccess = () => {
    const token = localStorage.getItem('authToken');
    const decodedUser = jwtDecode(token);
    setUser(decodedUser);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    navigate('/login');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={!user ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
        
        <Route 
          path="/*" 
          element={user ? <Layout user={user} onLogout={handleLogout} onToggleColorMode={toggleColorMode} /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard user={user} />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="users" element={<AdminRoute user={user}><UsersPage /></AdminRoute>} />
          <Route path="halls" element={<AdminRoute user={user}><HallsPage /></AdminRoute>} />
          <Route path="requests" element={<AdminRoute user={user}><BookingRequestsPage /></AdminRoute>} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;