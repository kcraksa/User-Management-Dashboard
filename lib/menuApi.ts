import axios from './axios'
import { MenuCreatePayload } from '@/types/menu'

export async function listMenus(params?: any){
  const res = await axios.get(process.env.NEXT_PUBLIC_API_SERVICE_USER + '/v1/modules', { params })
  const data = res.data?.data?.data || res.data;
  return Array.isArray(data) ? data : [];
}

export async function getMenu(id:number){
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_SERVICE_USER}/v1/modules/${id}`)
  return res.data?.data || res?.data
}

export async function createMenu(payload:MenuCreatePayload){
  const res = await axios.post(process.env.NEXT_PUBLIC_API_SERVICE_USER + '/v1/modules', payload)
  return res.data
}

export async function updateMenu(id:number,payload:MenuCreatePayload){
  const res = await axios.put(`${process.env.NEXT_PUBLIC_API_SERVICE_USER}/v1/modules/${id}`, payload)
  return res.data
}

export async function deleteMenu(id:number){
  const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_SERVICE_USER}/v1/modules/${id}`)
  return res.data
}
