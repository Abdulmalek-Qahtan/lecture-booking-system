import { NavLink, Outlet } from 'react-router-dom';
import { Box, Toolbar, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Typography, IconButton, Button } from '@mui/material';
import { Dashboard as DashboardIcon, People as PeopleIcon, MeetingRoom as MeetingRoomIcon, PlaylistAddCheck as PlaylistAddCheckIcon, CalendarMonth as CalendarMonthIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// --- هنا تم التصحيح: أضفنا user ---
function Layout({ user, onLogout, onToggleColorMode }) {
  const drawerWidth = 240;
  const theme = useTheme();

  // الروابط الأساسية التي يراها الجميع
  const baseNavItems = [
    { text: 'لوحة التحكم', icon: <DashboardIcon />, path: '/' },
    { text: 'التقويم', icon: <CalendarMonthIcon />, path: '/calendar' },
  ];

  // روابط الأدمن فقط
  const adminNavItems = [
    { text: 'إدارة المستخدمين', icon: <PeopleIcon />, path: '/users' },
    { text: 'إدارة القاعات', icon: <MeetingRoomIcon />, path: '/halls' },
    { text: 'طلبات الحجز', icon: <PlaylistAddCheckIcon />, path: '/requests' },
  ];
  
  // دمج الروابط بناءً على دور المستخدم
  const navigationItems = user?.role === 'admin' ? [...baseNavItems, ...adminNavItems] : baseNavItems;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            نظام إدارة القاعات
          </Typography>
          <IconButton sx={{ ml: 1 }} onClick={onToggleColorMode} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Button color="inherit" onClick={onLogout}>تسجيل الخروج</Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navigationItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={NavLink} to={item.path} end={item.path === '/'}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;