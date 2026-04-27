import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8085',
});

export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const chatQuery = async (query, context) => {
  const response = await api.post('/api/chat/query', { query, context });
  return response.data;
};

export const agentExecute = async (intent, code, context) => {
  const response = await api.post('/api/agent/execute', { intent, code, context });
  return response.data;
};

export const uploadRepo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/upload/repo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export default api;
