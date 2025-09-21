const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Root endpoint ---
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Lecture Hall Booking API. The server is running correctly." });
});

// --- الاتصال بقاعدة البيانات ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- تعريف شكل بيانات القاعات (Hall) ---
const HallSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  available: { type: Boolean, default: true },
});
const Hall = mongoose.model('Hall', HallSchema);

// --- تعريف شكل بيانات المستخدم (User) ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' }
});
const User = mongoose.model('User', UserSchema);

// --- ***تعديل***: تعريف شكل بيانات الحجوزات (Booking) ---
const BookingSchema = new mongoose.Schema({
  hall: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  department: { type: String, required: true },
  level: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  }
});
const Booking = mongoose.model('Booking', BookingSchema);

// --- Middleware للتحقق من صلاحيات الأدمن ---
const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret');
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// --- Endpoints الخاصة بالمستخدمين ---
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور خاطئة' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور خاطئة' });
    }
    const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET || 'your_secret', { expiresIn: '1h' });
    res.json({ success: true, message: 'تم تسجيل الدخول بنجاح', token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/users/:id', adminAuth, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
        return res.status(400).json({ message: "Admin cannot delete their own account." });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found"});
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Endpoints الخاصة بالقاعات ---
app.get('/api/halls', async (req, res) => {
  try {
    const halls = await Hall.find();
    res.json(halls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/halls', adminAuth, async (req, res) => {
  const hall = new Hall({ name: req.body.name, capacity: req.body.capacity });
  try {
    const newHall = await hall.save();
    res.status(201).json(newHall);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/halls/:id', adminAuth, async (req, res) => {
  try {
    const hall = await Hall.findByIdAndDelete(req.params.id);
    if (!hall) return res.status(404).json({ message: "Hall not found"});
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/halls/:id', adminAuth, async (req, res) => {
  try {
    const updatedHall = await Hall.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedHall) return res.status(404).json({ message: "Hall not found"});
    res.json(updatedHall);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Endpoints الخاصة بالحجوزات (Bookings) ---

// --- ***تعديل***: Endpoint لتقديم طلب حجز مع التحقق من التعارض ---
app.post('/api/bookings/request', async (req, res) => {
  try {
    const { hall, user, date, startTime, endTime, subject, department, level } = req.body;
    
    // تحويل التاريخ لضمان المقارنة الصحيحة
    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(bookingDate.setUTCHours(23, 59, 59, 999));

    // منطق التحقق من التعارض
    const conflictingBooking = await Booking.findOne({
      hall: hall,
      date: { $gte: startOfDay, $lt: endOfDay },
      status: 'approved', // التحقق من الحجوزات الموافق عليها فقط
      $or: [ // التحقق من تداخل الأوقات
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (conflictingBooking) {
      return res.status(409).json({ message: 'عذرًا، هذه القاعة محجوزة بالفعل في هذا الوقت' });
    }

    const newBooking = new Booking({ 
      hall, 
      user, 
      date, 
      startTime, 
      endTime, 
      subject, 
      department, 
      level, 
      status: 'pending' 
    });
    await newBooking.save();
    res.status(201).json({ message: 'Booking request submitted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/bookings', adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('hall')
      .populate('user', 'username');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/bookings/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // If status is 'rejected' or 'pending', it's safe to update directly
    if (status === 'rejected' || status === 'pending') {
      const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (!updatedBooking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      return res.json(updatedBooking);
    }

    // If status is 'approved', perform conflict check
    if (status === 'approved') {
      // First, find the booking to get its details
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Convert date to start and end of day for proper comparison
      const bookingDate = new Date(booking.date);
      const startOfDay = new Date(bookingDate.setUTCHours(0, 0, 0, 0));
      const endOfDay = new Date(bookingDate.setUTCHours(23, 59, 59, 999));

      // Check for conflicting approved bookings
      const conflictingBooking = await Booking.findOne({
        _id: { $ne: booking._id }, // Exclude the current booking
        hall: booking.hall,
        date: { $gte: startOfDay, $lt: endOfDay },
        status: 'approved',
        $or: [ // Check for time overlap
          { startTime: { $lt: booking.endTime }, endTime: { $gt: booking.startTime } }
        ]
      });

      if (conflictingBooking) {
        return res.status(409).json({ 
          message: 'Conflict detected: Another approved booking exists for the same hall and time slot' 
        });
      }

      // No conflict found, proceed to update
      const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
      return res.json(updatedBooking);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Endpoint for dashboard statistics ---
app.get('/api/stats/summary', adminAuth, async (req, res) => {
  try {
    // Perform all database queries simultaneously using Promise.all
    const [totalUsers, totalHalls, pendingBookings, approvedBookings] = await Promise.all([
      User.countDocuments(),
      Hall.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'approved' })
    ]);

    // Return the statistics as a JSON object
    res.json({
      totalUsers,
      totalHalls,
      pendingBookings: pendingBookings,
      approvedBookings
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// --- Public endpoint for approved bookings ---
app.get('/api/public/bookings', async (req, res) => {
  try {
    // Build dynamic query object
    const query = { status: 'approved' };
    
    // Add department filter if provided and not empty
    if (req.query.department && req.query.department.trim() !== '') {
      query.department = req.query.department;
    }
    
    // Add level filter if provided and not empty
    if (req.query.level && req.query.level.trim() !== '') {
      query.level = req.query.level;
    }
    
    const bookings = await Booking.find(query)
      .populate('hall', 'name')
      .populate('user', 'username')
      .sort({ date: 1, startTime: 1 });
    
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch public bookings' });
  }
});

// --- Recent bookings endpoint for admin dashboard ---
app.get('/api/bookings/recent', adminAuth, async (req, res) => {
  try {
    const recentBookings = await Booking.find()
      .populate('hall', 'name')
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json(recentBookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recent bookings' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});