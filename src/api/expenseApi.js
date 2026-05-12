import api from './axios';

export const getExpenses = (params) => api.get('/expenses', { params });
export const getExpense = (id) => api.get(`/expenses/${id}`);
function toFormData(data) {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v instanceof Blob) {
      fd.append(k, v, v instanceof File ? v.name : k);
    } else if (v !== null && v !== undefined && v !== '') {
      fd.append(k, v);
    }
  });
  return fd;
}

export const createExpense = (data) => api.post('/expenses', toFormData(data));
export const updateExpense = (id, data) => {
  const fd = toFormData(data);
  fd.append('_method', 'PUT');
  return api.post(`/expenses/${id}`, fd);
};
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

export const getCategories = () => api.get('/expense-categories');
export const createCategory = (data) => api.post('/expense-categories', data);
