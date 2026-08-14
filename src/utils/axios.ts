import axios from 'axios';
// config
import { BE_URL } from '../config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: BE_URL });

axiosInstance.interceptors.request.use((config) => {
  const outletId = localStorage.getItem('activeOutletId');
  if (outletId) {
    config.headers = config.headers || {};
    config.headers['x-outlet-id'] = outletId;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;
