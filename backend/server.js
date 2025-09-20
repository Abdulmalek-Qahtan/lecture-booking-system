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

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- تعريف شكل بيانات القاعات (Hall) ---
const HallSchema = new mongoose.Schema({ /* ... الكود هنا لم يتغير ... */ });
const Hall = mongoose.model('Hall', HallSchema);

// --- الإضافة الجديدة: تعريف شكل بيانات المستخدم (User) ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' } // admin, doctor, student
});
const User = mongoose.model('User', UserSchema);
// ----------------------------------------------------

// --- Endpoints ---

// **Endpoint جديد: إنشاء حساب مستخدم**
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
      role
    });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// **Endpoint معدل: تسجيل الدخول**
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
    // إنشاء توكن (Token) لتأكيد تسجيل الدخول
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your_default_secret', { expiresIn: '1h' });
    res.json({ success: true, message: 'تم تسجيل الدخول بنجاح', token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ... (بقية Endpoints الخاصة بالقاعات GET, POST, DELETE, PUT لم تتغير) ...

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});