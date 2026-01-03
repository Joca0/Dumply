import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

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
export const getActiveRentals = () => api.get('/rentals/active');
export const createRental = (data) => api.post('/rentals', data);
export const returnRental = (id) => api.post(`/rentals/${id}/return`);
export const deleteRental = (id) => api.delete(`/rentals/${id}`);

export const getInvoices = () => api.get('/invoices');
export const getInvoice = (id) => api.get(`/invoices/${id}`);
export const updateInvoiceStatus = (id, status) => api.put(`/invoices/${id}/status`, status, {
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;