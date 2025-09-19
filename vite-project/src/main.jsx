import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// --- إنشاء الثيم المخصص ---
const theme = createTheme({
  // 1. تحديد اتجاه الموقع لليمين (RTL Support)
  direction: 'rtl',

  // 2. تحديد الألوان الأساسية للموقع
  palette: {
    mode: 'dark', // تفعيل الوضع الليلي الاحترافي
    primary: {
      main: '#90caf9', // لون أزرق سماوي بدلاً من الأزرق الافتراضي
    },
    background: {
      default: '#121212', // لون الخلفية
      paper: '#1e1e1e',   // لون العناصر مثل الجداول والنماذج
    },
  },

  // 3. تحديد الخط الأساسي لكل المكونات
  typography: {
    fontFamily: 'Cairo, sans-serif',
    h5: {
      fontWeight: 700, // جعل العناوين أعرض
    },
    button: {
      fontWeight: 700, // جعل خط الأزرار أعرض
    }
  },
});
// ------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 4. تطبيق الثيم على كامل المشروع */}
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* هذا المكون يصلح التنسيقات الافتراضية للمتصفح */}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);