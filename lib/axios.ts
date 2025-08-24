import axios from 'axios';
import { getSession } from 'next-auth/react';

const instance = axios.create();

// request interceptor to attach token from session
instance.interceptors.request.use(async (config) => {
  try {
    const session = await getSession();
    const token = (session as any)?.accessToken || null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // ignore
  }
  return config;
});

export default instance;
