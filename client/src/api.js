import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const getModels = () => api.get('/descriptions/models').then(r => r.data);

export const generateDescription = (payload) =>
  api.post('/descriptions/generate', payload).then(r => r.data);

export const getHistory = (limit = 20) =>
  api.get(`/descriptions/history?limit=${limit}`).then(r => r.data);

export const deleteHistoryItem = (id) =>
  api.delete(`/descriptions/history/${id}`).then(r => r.data);

export const clearHistory = () =>
  api.delete('/descriptions/history').then(r => r.data);
