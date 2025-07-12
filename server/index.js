const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'data.json');
let data = { users: [], bookings: [], payments: [], passes: [], spaces: [] };

function nextId(collection) {
  return collection.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
}

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
  let bookings = data.bookings;
  if (req.user.role !== 'admin') {
    bookings = bookings.filter(b => b.user_id === req.user.id);
  }
  res.json(bookings);
});

app.post('/bookings', auth, (req, res) => {
  const booking = { id: nextId(data.bookings), user_id: req.user.id, created_date: new Date().toISOString(), ...req.body };
  data.bookings.push(booking);
  saveData();
  res.json(booking);
});

app.get('/payments', auth, (req, res) => {
  let payments = data.payments;
  if (req.user.role !== 'admin') {
    payments = payments.filter(p => p.user_id === req.user.id);
  }
  res.json(payments);
});

app.post('/payments', auth, (req, res) => {
  const payment = { id: nextId(data.payments), user_id: req.user.id, created_date: new Date().toISOString(), ...req.body };
  data.payments.push(payment);
  saveData();
  res.json(payment);
});

app.get('/passes', auth, (req, res) => {
  let passes = data.passes;
  if (req.user.role !== 'admin') {
    passes = passes.filter(p => p.user_id === req.user.id);
  }
  if (req.query.is_active !== undefined) {
    passes = passes.filter(p => String(p.is_active) === req.query.is_active);
  }
  res.json(passes);
});

app.post('/passes', auth, (req, res) => {
  const pass = { id: nextId(data.passes), ...req.body };
  data.passes.push(pass);
  saveData();
  res.json(pass);
});

app.put('/passes/:id', auth, (req, res) => {
  const pass = data.passes.find(p => p.id == req.params.id);
  if (!pass) return res.status(404).json({ message: 'Not found' });
  Object.assign(pass, req.body);
  saveData();
  res.json(pass);
});

app.delete('/passes/:id', auth, (req, res) => {
  data.passes = data.passes.filter(p => p.id != req.params.id);
  saveData();
  res.json({ success: true });
});

app.get('/spaces', auth, (req, res) => {
  let spaces = data.spaces;
  if (req.query.is_active !== undefined) {
    spaces = spaces.filter(s => String(s.is_active) === req.query.is_active);
  }
  res.json(spaces);
});

app.post('/spaces', auth, (req, res) => {
  const space = { id: nextId(data.spaces), ...req.body };
  data.spaces.push(space);
  saveData();
  res.json(space);
});

app.put('/spaces/:id', auth, (req, res) => {
  const space = data.spaces.find(s => s.id == req.params.id);
  if (!space) return res.status(404).json({ message: 'Not found' });
  Object.assign(space, req.body);
  saveData();
  res.json(space);
});

app.delete('/spaces/:id', auth, (req, res) => {
  data.spaces = data.spaces.filter(s => s.id != req.params.id);
  saveData();
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Local API running on http://localhost:${PORT}`));
