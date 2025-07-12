const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'data.json');
let data = { users: [], bookings: [], payments: [], passes: [], spaces: [] };

function loadData() {
  if (fs.existsSync(DATA_PATH)) {
    data = JSON.parse(fs.readFileSync(DATA_PATH));
  }
}

function saveData() {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

loadData();

// Simple auth middleware (mock)
function auth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  const user = data.users.find(u => `Bearer ${u.token}` === token);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  req.user = user;
  next();
}

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = data.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const token = Math.random().toString(36).slice(2);
  user.token = token;
  saveData();
  res.json({ token });
});

app.get('/users/me', auth, (req, res) => {
  const { password, token, ...userData } = req.user;
  res.json(userData);
});

app.put('/users/me', auth, (req, res) => {
  Object.assign(req.user, req.body);
  saveData();
  res.json({ success: true });
});

app.get('/users', auth, (req, res) => {
  res.json(data.users.map(({ password, token, ...u }) => u));
});

app.get('/bookings', auth, (req, res) => {
  res.json(data.bookings.filter(b => b.user_id === req.user.id));
});

app.get('/payments', auth, (req, res) => {
  res.json(data.payments.filter(p => p.user_id === req.user.id));
});

app.get('/passes', auth, (req, res) => {
  res.json(data.passes.filter(p => p.user_id === req.user.id));
});

app.get('/spaces', auth, (req, res) => {
  res.json(data.spaces);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Local API running on http://localhost:${PORT}`));
