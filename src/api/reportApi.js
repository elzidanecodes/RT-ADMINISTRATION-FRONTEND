import api from './axios';

export const getDashboard = () => api.get('/reports/dashboard');
export const getAnnualChart = (year) => api.get('/reports/annual', { params: { year } });
export const getMonthlyDetail = (year, month) => api.get('/reports/monthly', { params: { year, month } });
