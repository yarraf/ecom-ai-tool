import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL: BASE });

export const getModels = () => api.get('/descriptions/models').then(r => r.data);

export const generateDescription = (payload) =>
  api.post('/descriptions/generate', payload).then(r => r.data);

export const getHistory = (limit = 20) =>
  api.get(`/descriptions/history?limit=${limit}`).then(r => r.data);

export const deleteHistoryItem = (id) =>
  api.delete(`/descriptions/history/${id}`).then(r => r.data);

export const clearHistory = () =>
  api.delete('/descriptions/history').then(r => r.data);
