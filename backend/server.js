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
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your_secret', { expiresIn: '1h' });
    res.json({ success: true, message: 'تم تسجيل الدخول بنجاح', token });
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

app.post('/api/halls', async (req, res) => {
  const hall = new Hall({ name: req.body.name, capacity: req.body.capacity });
  try {
    const newHall = await hall.save();
    res.status(201).json(newHall);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/halls/:id', async (req, res) => {
  try {
    const hall = await Hall.findByIdAndDelete(req.params.id);
    if (!hall) return res.status(404).json({ message: "Hall not found"});
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/halls/:id', async (req, res) => {
  try {
    const updatedHall = await Hall.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedHall) return res.status(404).json({ message: "Hall not found"});
    res.json(updatedHall);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});