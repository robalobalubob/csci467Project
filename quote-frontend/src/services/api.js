import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});
/* Error handling currently disabled
api.interceptors.response.use(
    (response) => response,
    (error) => {
      // You can handle specific error statuses here
      if (error.response && error.response.status === 401) {
        // Handle Unauthorized access, e.g., redirect to login
      }
      return Promise.reject(error);
    }
  );
*/
export default api;
