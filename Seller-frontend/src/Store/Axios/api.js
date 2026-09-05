import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://api.prabhupooja.com/api/v1',
  timeout: 80000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;


