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
  async list() {
    return api.listBookings();
  },
  async filter() {
    return api.listBookings();
  }
};

export const Payment = {
  async list() {
    return api.listPayments();
  },
  async filter() {
    return api.listPayments();
  }
};

export const Pass = {
  async list() {
    return api.listPasses();
  }
};

export const Space = {
  async list() {
    return api.listSpaces();
  }
};
