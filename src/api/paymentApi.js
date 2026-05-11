import api from './axios';

export const getPayments = (params) => api.get('/payments', { params });
export const recordPayment = (data) => {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => v != null && form.append(k, v));
  return api.post('/payments', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const payAnnual = (data) => api.post('/payments/pay-annual', data);
