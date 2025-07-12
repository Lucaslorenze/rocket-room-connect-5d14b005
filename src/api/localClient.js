const API_URL = 'http://localhost:3001';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  if (!res.ok) throw new Error('API error');
  return res.json();
}

export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  localStorage.setItem('token', data.token);
  return data;
}

export async function me() {
  return request('/users/me');
}

export async function updateMe(payload) {
  return request('/users/me', { method: 'PUT', body: JSON.stringify(payload) });
}

export async function listBookings() {
  return request('/bookings');
}

export async function listPayments() {
  return request('/payments');
}

export async function listPasses() {
  return request('/passes');
}

export async function listSpaces() {
  return request('/spaces');
}
