import axios from 'axios';

const api = axios.create({
  baseURL: 'http://164.152.252.146:8080',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@dumply:token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
    res => res,
    error => {
      if (error.response?.status === 403) {
        window.dispatchEvent(
            new CustomEvent('auth:logout', {
              detail: { reason: 'expired' }
            })
        );
      }

      return Promise.reject(error);
    }
);

export const login = (credentials) => api.post('/auth/login', credentials);
export const profile = (data) => api.get('/auth/me', data);

export const getEquipments = () => api.get('/equipments');
export const getEquipment = (id) => api.get(`/equipments/${id}`);
export const createEquipment = (data) => api.post('/equipments', data);
export const updateEquipment = (id, data) => api.put(`/equipments/${id}`, data);
export const deleteEquipment = (id) => api.delete(`/equipments/${id}`);

export const getCustomers = () => api.get('/customers');
export const getCustomer = (id) => api.get(`/customers/${id}`);
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

export const getRentals = () => api.get('/rentals');
export const getRental = (id) => api.get(`/rentals/${id}`);
export const getActiveRentals = () => api.get('/rentals/active');
export const createRental = (data) => api.post('/rentals', data);
export const updateRental = (id, data) => api.put(`/rentals/${id}`, data)
export const returnRental = (id) => api.post(`/rentals/${id}/return`);
export const deleteRental = (id) => api.delete(`/rentals/${id}`);

export const getInvoices = () => api.get('/invoices');
export const getInvoice = (id) => api.get(`/invoices/${id}`);
export const createInvoice = (data) => api.post('/invoices', data);
export const getUninvoicedRentals = (customerId) => api.get(`/invoices/uninvoiced/${customerId}`);
export const updateInvoiceStatus = (id, status) => api.put(`/invoices/${id}/status`, status, {
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;