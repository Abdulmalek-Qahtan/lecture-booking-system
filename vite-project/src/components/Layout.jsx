import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Box, Toolbar, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Typography, IconButton, Button, useTheme, useMediaQuery } from '@mui/material';
import { Dashboard as DashboardIcon, People as PeopleIcon, MeetingRoom as MeetingRoomIcon, PlaylistAddCheck as PlaylistAddCheckIcon, CalendarMonth as CalendarMonthIcon, School as SchoolIcon, Menu as MenuIcon } from '@mui/icons-material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// --- هنا تم التصحيح: أضفنا user ---
function Layout({ user, onLogout, onToggleColorMode }) {
  const drawerWidth = 240;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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

  // محتوى الـ Drawer
  const drawerContent = (
    <Box>
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
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { xs: 'block', md: 'none' } 
            }}
          >
            <MenuIcon />
          </IconButton>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            نظام إدارة القاعات
          </Typography>
          <IconButton sx={{ ml: 1 }} onClick={onToggleColorMode} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Button color="inherit" onClick={onLogout}>تسجيل الخروج</Button>
        </Toolbar>
      </AppBar>
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` }
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;