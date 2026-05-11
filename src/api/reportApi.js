import api from './axios';

export const getDashboard = () => api.get('/reports/dashboard-summary');
export const getAnnualChart = (year) => api.get('/reports/annual-chart', { params: { year } });
export const getMonthlyDetail = (year, month) => api.get('/reports/monthly-detail', { params: { year, month } });
