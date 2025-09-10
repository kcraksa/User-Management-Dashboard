import axios from './axios';
import { User } from '@/types/user';

export const listUsers = async (params?: any) => {
  const response = await axios.get(process.env.NEXT_PUBLIC_API_SERVICE_USER + '/v1/list', { params });
  return response.data;
};

export const getUser = async (id: number) => {
  const response = await axios.get(process.env.NEXT_PUBLIC_API_SERVICE_USER + `/v1/detail/${id}`);
  return response.data.data;
};

export const createUser = async (data: Partial<User>) => {
  const response = await axios.post(process.env.NEXT_PUBLIC_API_SERVICE_USER + '/v1/create', data);
  return response.data.data;
};

export const updateUser = async (id: number, data: Partial<User>) => {
  const response = await axios.put(process.env.NEXT_PUBLIC_API_SERVICE_USER + `/v1/update/${id}`, data);
  return response.data.data;
};

export const deleteUser = async (id: number) => {
  const response = await axios.delete(process.env.NEXT_PUBLIC_API_SERVICE_USER + `/v1/delete/${id}`);
  return response.data;
};
