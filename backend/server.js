const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let lectureHalls = [
  { id: 1, name: 'القاعة الأولى', capacity: 50, available: true },
  { id: 2, name: 'القاعة الثانية', capacity: 100, available: false },
  { id: 3, name: 'قاعة الاجتماعات', capacity: 25, available: true },
];

// Endpoint for login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '12345') {
    res.json({ success: true, message: 'تم تسجيل الدخول بنجاح' });
  } else {
    res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور خاطئة' });
  }
});

// Endpoint to GET all halls (Read)
app.get('/api/halls', (req, res) => {
  res.json(lectureHalls);
});

// Endpoint to POST a new hall (Create)
app.post('/api/halls', (req, res) => {
  const { name, capacity } = req.body;
  const newHall = {
    id: Date.now(),
    name,
    capacity: parseInt(capacity),
    available: true,
  };
  lectureHalls.push(newHall);
  res.status(201).json(newHall);
});

// Endpoint to DELETE a hall (Delete)
app.delete('/api/halls/:id', (req, res) => {
  const { id } = req.params;
  lectureHalls = lectureHalls.filter(hall => hall.id !== parseInt(id));
  res.status(200).json({ message: 'تم الحذف بنجاح' });
});

// Endpoint to PUT (update) a hall (Update)
app.put('/api/halls/:id', (req, res) => {
  const { id } = req.params;
  const { name, capacity } = req.body;
  const hallIndex = lectureHalls.findIndex(hall => hall.id === parseInt(id));

  if (hallIndex !== -1) {
    lectureHalls[hallIndex].name = name || lectureHalls[hallIndex].name;
    lectureHalls[hallIndex].capacity = parseInt(capacity) || lectureHalls[hallIndex].capacity;
    res.json(lectureHalls[hallIndex]);
  } else {
    res.status(404).json({ message: 'القاعة غير موجودة' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});