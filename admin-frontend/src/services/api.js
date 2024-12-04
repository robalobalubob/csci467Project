import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/admin', 
});

export default api;