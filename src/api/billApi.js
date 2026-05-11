import api from './axios';

export const getBills = (params) => api.get('/bills', { params });
export const getBill = (id) => api.get(`/bills/${id}`);
export const generateBills = (data) => api.post('/bills/generate', data);
