import api from './axios';

export const getExpenses = (params) => api.get('/expenses', { params });
export const getExpense = (id) => api.get(`/expenses/${id}`);
export const createExpense = (data) => {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => v != null && form.append(k, v));
  return api.post('/expenses', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const updateExpense = (id, data) => {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => v != null && form.append(k, v));
  form.append('_method', 'PUT');
  return api.post(`/expenses/${id}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

export const getCategories = () => api.get('/expense-categories');
export const createCategory = (data) => api.post('/expense-categories', data);
