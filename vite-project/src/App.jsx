import { useState, useMemo } from 'react';
import LoginPage from './components/LoginPage.jsx';
import Dashboard from './components/Dashboard.jsx';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mode, setMode] = useState('dark'); // 'dark' or 'light'

  // دالة لتبديل الوضع
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // --- إنشاء الثيم الديناميكي المستوحى من تويتر ---
  const theme = useMemo(() => createTheme({
    direction: 'rtl',
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // ثيم تويتر النهاري
            primary: { main: '#1DA1F2' }, // أزرق تويتر
            background: { default: '#FFFFFF', paper: '#F5F8FA' },
            text: { primary: '#14171A' },
          }
        : {
            // ثيم تويتر الليلي (Dim)
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
  // ------------------------------------------------

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