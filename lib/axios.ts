import axios from 'axios';
import { getAuthPayload } from '@/lib/auth';

const instance = axios.create();

// set default auth header from cookie if available
const auth = getAuthPayload();
if (auth && auth.token) {
  instance.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
}

// request interceptor to attach token from cookie-based auth
instance.interceptors.request.use(async (config) => {
  try {
    const payload = getAuthPayload();
    const token = payload?.token || null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // ignore
  }
  return config;
});

export default instance;
