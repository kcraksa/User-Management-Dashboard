import axios from './axios'
import { AccessCreatePayload } from '@/types/access'

export async function listAccess(params?: any){
  const res = await axios.get(process.env.NEXT_PUBLIC_API_SERVICE_USER + '/v1/module-to-role', { params })
  const data = res.data.data?.data || res.data;
  const accesses = Array.isArray(data) ? data : [];
  // Convert numeric values to booleans for frontend
  return accesses.map((access: any) => ({
    ...access,
    is_view: access.is_view === 1 || access.is_view === true,
    is_add: access.is_add === 1 || access.is_add === true,
    is_detail: access.is_detail === 1 || access.is_detail === true,
    is_update: access.is_update === 1 || access.is_update === true,
    is_delete: access.is_delete === 1 || access.is_delete === true,
    is_approval: access.is_approval === 1 || access.is_approval === true,
    is_activation: access.is_activation === 1 || access.is_activation === true,
  }));
}

export async function getAccess(id:number){
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_SERVICE_USER}/v1/module-to-role/${id}`)
  const data = res.data?.data || res?.data;
  // Convert numeric values to booleans for frontend
  return {
    ...data,
    is_view: data.is_view === 1 || data.is_view === true,
    is_add: data.is_add === 1 || data.is_add === true,
    is_detail: data.is_detail === 1 || data.is_detail === true,
    is_update: data.is_update === 1 || data.is_update === true,
    is_delete: data.is_delete === 1 || data.is_delete === true,
    is_approval: data.is_approval === 1 || data.is_approval === true,
    is_activation: data.is_activation === 1 || data.is_activation === true,
  };
}

export async function createAccess(payload:AccessCreatePayload){
  // Convert boolean values to numbers for API
  const apiPayload = {
    ...payload,
    is_view: payload.is_view ? 1 : 0,
    is_add: payload.is_add ? 1 : 0,
    is_detail: payload.is_detail ? 1 : 0,
    is_update: payload.is_update ? 1 : 0,
    is_delete: payload.is_delete ? 1 : 0,
    is_approval: payload.is_approval ? 1 : 0,
    is_activation: payload.is_activation ? 1 : 0,
  };
  console.log('API payload being sent:', apiPayload);
  const res = await axios.post(process.env.NEXT_PUBLIC_API_SERVICE_USER + '/v1/module-to-role', apiPayload)
  return res.data
}

export async function updateAccess(id:number,payload:AccessCreatePayload){
  // Convert boolean values to numbers for API
  const apiPayload = {
    ...payload,
    is_view: payload.is_view ? 1 : 0,
    is_add: payload.is_add ? 1 : 0,
    is_detail: payload.is_detail ? 1 : 0,
    is_update: payload.is_update ? 1 : 0,
    is_delete: payload.is_delete ? 1 : 0,
    is_approval: payload.is_approval ? 1 : 0,
    is_activation: payload.is_activation ? 1 : 0,
  };
  console.log('API payload being sent for update:', apiPayload);
  const res = await axios.put(`${process.env.NEXT_PUBLIC_API_SERVICE_USER}/v1/module-to-role/${id}`, apiPayload)
  return res.data
}

export async function deleteAccess(id:number){
  const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_SERVICE_USER}/v1/module-to-role/${id}`)
  return res.data
}
