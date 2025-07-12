const API_URL = 'http://localhost:3001';

export async function request(endpoint, options = {}) {
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

export async function listBookings(params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return request(`/bookings${query}`);
}

export async function createBooking(payload) {
  return request('/bookings', { method: 'POST', body: JSON.stringify(payload) });
}

export async function listPayments(params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return request(`/payments${query}`);
}

export async function createPayment(payload) {
  return request('/payments', { method: 'POST', body: JSON.stringify(payload) });
}

export async function listPasses(params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return request(`/passes${query}`);
}

export async function createPass(payload) {
  return request('/passes', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updatePass(id, payload) {
  return request(`/passes/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deletePass(id) {
  return request(`/passes/${id}`, { method: 'DELETE' });
}

export async function listSpaces(params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return request(`/spaces${query}`);
}

export async function createSpace(payload) {
  return request('/spaces', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateSpace(id, payload) {
  return request(`/spaces/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteSpace(id) {
  return request(`/spaces/${id}`, { method: 'DELETE' });
}
