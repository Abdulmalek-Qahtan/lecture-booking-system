import { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function HallsPage() {
  // State Management
  const [halls, setHalls] = useState([]);
  const [newHallName, setNewHallName] = useState('');
  const [newHallCapacity, setNewHallCapacity] = useState('');
  const [editingHallId, setEditingHallId] = useState(null);
  const [updatedHallData, setUpdatedHallData] = useState({ name: '', capacity: '' });

  // Data Fetching
  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/halls`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHalls(data);
      } else {
        console.error('Failed to fetch halls');
      }
    } catch (error) {
      console.error('فشل في جلب القاعات:', error);
    }
  };

  // CRUD Functions
  const handleAddHall = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/halls`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newHallName, capacity: newHallCapacity }),
      });
      
      if (response.ok) {
        const addedHall = await response.json();
        setHalls(prev => [...prev, addedHall]);
        setNewHallName('');
        setNewHallCapacity('');
      } else {
        console.error('Failed to add hall');
      }
    } catch (error) {
      console.error('فشل في إضافة القاعة:', error);
    }
  };

  const handleDeleteHall = async (hallIdToDelete) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/halls/${hallIdToDelete}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setHalls(prev => prev.filter(hall => hall._id !== hallIdToDelete));
      } else {
        console.error('Failed to delete hall');
      }
    } catch (error) {
      console.error('فشل في حذف القاعة:', error);
    }
  };

  const handleEditClick = (hall) => {
    setEditingHallId(hall._id);
    setUpdatedHallData({ name: hall.name, capacity: hall.capacity });
  };

  const handleUpdateHall = async (hallId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/halls/${hallId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedHallData),
      });
      
      if (response.ok) {
        const updatedHall = await response.json();
        setHalls(prev => prev.map(hall => (hall._id === hallId ? updatedHall : hall)));
        setEditingHallId(null);
      } else {
        console.error('Failed to update hall');
      }
    } catch (error) {
      console.error('فشل في تحديث القاعة:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4">إدارة القاعات</Typography>
      </Box>

      {/* Add Hall Form */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
      >
        <Box component={Paper} p={3} mb={4}>
          <Typography variant="h5" component="h2" gutterBottom>
            إضافة قاعة جديدة
          </Typography>
          <Box 
            component="form" 
            onSubmit={handleAddHall} 
            sx={{ display: 'flex', gap: 2, alignItems: 'center' }}
          >
            <TextField 
              label="اسم القاعة" 
              value={newHallName} 
              onChange={(e) => setNewHallName(e.target.value)} 
              required 
              fullWidth
            />
            <TextField 
              label="سعة القاعة" 
              type="number" 
              value={newHallCapacity} 
              onChange={(e) => setNewHallCapacity(e.target.value)} 
              required 
              fullWidth
            />
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button type="submit" variant="contained" size="large">
                إضافة
              </Button>
            </motion.div>
          </Box>
        </Box>
      </motion.div>

      {/* Halls Table */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.2 }}
      >
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
                    key={hall._id} 
                    layout 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
                  >
                    {editingHallId === hall._id ? (
                      <>
                        <TableCell>
                          <TextField 
                            size="small" 
                            variant="standard" 
                            value={updatedHallData.name} 
                            onChange={(e) => setUpdatedHallData({ 
                              ...updatedHallData, 
                              name: e.target.value 
                            })} 
                            fullWidth
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField 
                            size="small" 
                            variant="standard" 
                            type="number" 
                            value={updatedHallData.capacity} 
                            onChange={(e) => setUpdatedHallData({ 
                              ...updatedHallData, 
                              capacity: e.target.value 
                            })} 
                            fullWidth
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            onClick={() => handleUpdateHall(hall._id)} 
                            color="primary"
                          >
                            <SaveIcon />
                          </IconButton>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{hall.name}</TableCell>
                        <TableCell align="right">{hall.capacity}</TableCell>
                        <TableCell align="center">
                          <IconButton 
                            onClick={() => handleEditClick(hall)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDeleteHall(hall._id)} 
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
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
  );
}

export default HallsPage;
