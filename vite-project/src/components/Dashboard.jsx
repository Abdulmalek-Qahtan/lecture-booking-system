import { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, AppBar, Toolbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { useTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { motion, AnimatePresence } from 'framer-motion';

// --- رابط الخادم الجديد والنهائي ---
const API_BASE_URL = 'https://lecture-booking-system.onrender.com';

function Dashboard({ onLogout, onToggleColorMode }) {
  const [halls, setHalls] = useState([]);
  const [newHallName, setNewHallName] = useState('');
  const [newHallCapacity, setNewHallCapacity] = useState('');
  const [editingHallId, setEditingHallId] = useState(null);
  const [updatedHallData, setUpdatedHallData] = useState({ name: '', capacity: '' });
  const theme = useTheme();

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/halls`);
        const data = await response.json();
        setHalls(data);
      } catch (error) {
        console.error('فشل في جلب البيانات:', error);
      }
    };
    fetchHalls();
  }, []);

  const handleAddHall = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/halls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newHallName, capacity: newHallCapacity }),
      });
      const addedHall = await response.json();
      setHalls([...halls, addedHall]);
      setNewHallName('');
      setNewHallCapacity('');
    } catch (error) {
      console.error('فشل في إضافة القاعة:', error);
    }
  };

  const handleDeleteHall = async (hallIdToDelete) => {
    try {
      await fetch(`${API_BASE_URL}/api/halls/${hallIdToDelete}`, {
        method: 'DELETE',
      });
      setHalls(halls.filter(hall => hall.id !== hallIdToDelete));
    } catch (error) {
      console.error('فشل في حذف القاعة:', error);
    }
  };

  const handleEditClick = (hall) => {
    setEditingHallId(hall.id);
    setUpdatedHallData({ name: hall.name, capacity: hall.capacity });
  };
  
  const handleUpdateHall = async (hallId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/halls/${hallId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedHallData),
      });
      const updatedHall = await response.json();
      setHalls(halls.map(hall => (hall.id === hallId ? updatedHall : hall)));
      setEditingHallId(null);
    } catch (error) {
      console.error('فشل في تحديث القاعة:', error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            نظام إدارة قاعات المحاضرات
          </Typography>
          <IconButton sx={{ ml: 1 }} onClick={onToggleColorMode} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Button color="inherit" onClick={onLogout}>تسجيل الخروج</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Box component={Paper} p={3} mb={4}>
            <Typography variant="h5" component="h2" gutterBottom>
              إضافة قاعة جديدة
            </Typography>
            <Box component="form" onSubmit={handleAddHall} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField label="اسم القاعة" value={newHallName} onChange={(e) => setNewHallName(e.target.value)} required />
              <TextField label="سعة القاعة" type="number" value={newHallCapacity} onChange={(e) => setNewHallCapacity(e.target.value)} required />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button type="submit" variant="contained">إضافة</Button>
              </motion.div>
            </Box>
          </Box>
        </motion.div>
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>اسم القاعة</TableCell>
                  <TableCell align="right">السعة</TableCell>
                  <TableCell align="center">إجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {halls.map((hall) => (
                    <motion.tr
                      key={hall.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
                    >
                      {editingHallId === hall.id ? (
                        <>
                          <TableCell><TextField size="small" variant="standard" value={updatedHallData.name} onChange={(e) => setUpdatedHallData({ ...updatedHallData, name: e.target.value })} /></TableCell>
                          <TableCell align="right"><TextField size="small" variant="standard" type="number" value={updatedHallData.capacity} onChange={(e) => setUpdatedHallData({ ...updatedHallData, capacity: e.target.value })} /></TableCell>
                          <TableCell align="center">
                            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                              <IconButton onClick={() => handleUpdateHall(hall.id)} color="primary"><SaveIcon /></IconButton>
                            </motion.div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{hall.name}</TableCell>
                          <TableCell align="right">{hall.capacity}</TableCell>
                          <TableCell align="center">
                            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                              <IconButton onClick={() => handleEditClick(hall)}><EditIcon /></IconButton>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                              <IconButton onClick={() => handleDeleteHall(hall.id)} color="error"><DeleteIcon /></IconButton>
                            </motion.div>
                          </TableCell>
                        </>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>
      </Container>
    </motion.div>
  );
}

export default Dashboard;