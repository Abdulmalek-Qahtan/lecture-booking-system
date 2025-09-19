import { useState, useMemo, useEffect } from 'react'; // <-- إضافة useEffect
import LoginPage from './components/LoginPage.jsx';
import Dashboard from './components/Dashboard.jsx';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  // 1. عند بدء التشغيل، تحقق من الـ LocalStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  
  const [mode, setMode] = useState('dark');

  // 2. استخدم useEffect لتحديث الـ LocalStorage عند كل تغيير
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => createTheme({
    direction: 'rtl',
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            primary: { main: '#1DA1F2' },
            background: { default: '#FFFFFF', paper: '#F5F8FA' },
            text: { primary: '#14171A' },
          }
        : {
            primary: { main: '#1DA1F2' },
            background: { default: '#15202B', paper: '#192734' },
            text: { primary: '#FFFFFF' },
          }),
    },
    typography: {
      fontFamily: 'Cairo, sans-serif',
      button: { textTransform: 'none', fontWeight: 700 },
    },
  }), [mode]);

  // 3. الدوال الآن تتحكم في الحالة والـ LocalStorage معًا
  const handleLoginSuccess = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isLoggedIn ? (
        <Dashboard onLogout={handleLogout} onToggleColorMode={toggleColorMode} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </ThemeProvider>
  );
}

export default App;