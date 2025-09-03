import axios from 'axios';
import { getAuthPayload } from '@/lib/auth';

const instance = axios.create();

// attach X-APP-ID from environment (NEXT_PUBLIC_APP_ID) for every request
const APP_ID = (process.env.NEXT_PUBLIC_APP_ID as string) || '';
if (APP_ID) {
  instance.defaults.headers.common['X-APP-ID'] = APP_ID;
}

// set default auth header from cookie if available
const auth = getAuthPayload();
if (auth && auth.token) {
  instance.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
}

// request interceptor to attach token from cookie-based auth and ensure X-APP-ID present
instance.interceptors.request.use(async (config) => {
  try {
    const payload = getAuthPayload();
    const token = payload?.token || null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ensure X-APP-ID exists on each request (client env set at build time)
    if (APP_ID && config.headers) {
      // don't overwrite if caller set a different app id
      if (!config.headers['X-APP-ID'] && !config.headers['x-app-id']) {
        config.headers['X-APP-ID'] = APP_ID;
      }
    }
  } catch (err) {
    // ignore
  }
  return config;
});

export default instance;
