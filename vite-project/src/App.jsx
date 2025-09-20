import { useState, useMemo, useEffect } from 'react';
import LoginPage from './components/LoginPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import RegisterPage from './components/RegisterPage.jsx';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [mode, setMode] = useState('dark');
  const [currentView, setCurrentView] = useState('login');

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
    if (isLoggedIn) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('login');
    }
  }, [isLoggedIn]);

  const toggleColorMode = () => setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));

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

  const handleLoginSuccess = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onLogout={handleLogout} onToggleColorMode={toggleColorMode} />;
      case 'register':
        return <RegisterPage onShowLogin={() => setCurrentView('login')} />;
      case 'login':
      default:
        return <LoginPage onLoginSuccess={handleLoginSuccess} onShowRegister={() => setCurrentView('register')} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {renderView()}
    </ThemeProvider>
  );
}

export default App;