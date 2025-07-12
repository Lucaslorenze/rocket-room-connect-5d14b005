import * as api from './localClient.js';

export const User = {
  async me() {
    return api.me();
  },
  async updateMyUserData(data) {
    return api.updateMe(data);
  },
  async logout() {
    localStorage.removeItem('token');
  },
  async login(email, password) {
    return api.login(email, password);
  },
  async list() {
    return api.request('/users');
  }
};

export const Booking = {
  async list(params) {
    return api.listBookings(params);
  },
  async filter(params) {
    return api.listBookings(params);
  },
  async create(data) {
    return api.createBooking(data);
  }
};

export const Payment = {
  async list(params) {
    return api.listPayments(params);
  },
  async filter(params) {
    return api.listPayments(params);
  },
  async create(data) {
    return api.createPayment(data);
  }
};

export const Pass = {
  async list(params) {
    return api.listPasses(params);
  },
  async filter(params) {
    return api.listPasses(params);
  },
  async create(data) {
    return api.createPass(data);
  },
  async update(id, data) {
    return api.updatePass(id, data);
  },
  async delete(id) {
    return api.deletePass(id);
  }
};

export const Space = {
  async list(params) {
    return api.listSpaces(params);
  },
  async create(data) {
    return api.createSpace(data);
  },
  async update(id, data) {
    return api.updateSpace(id, data);
  },
  async delete(id) {
    return api.deleteSpace(id);
  }
};
