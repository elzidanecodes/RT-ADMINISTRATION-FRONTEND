import api from './axios';

export const getPayments = (params) => api.get('/payments', { params });
export const recordPayment = (data) => api.post('/payments', data);
export const payAnnual = (data) => api.post('/payments/pay-annual', data);
