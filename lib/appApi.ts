import axios from './axios'
import { AppCreatePayload } from '@/types/app'

export async function listApps(params?: any){
  const res = await axios.get(process.env.NEXT_PUBLIC_API_SERVICE_USER + '/v1/apps', { params })
  const data = res.data.data?.data || res.data;
  return Array.isArray(data) ? data : [];
}

export async function getApp(id:number){
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_SERVICE_USER}/v1/apps/${id}`)
  return res.data?.data || res?.data
}

export async function createApp(payload:AppCreatePayload){
  const res = await axios.post(process.env.NEXT_PUBLIC_API_SERVICE_USER + '/v1/apps', payload)
  return res.data
}

export async function updateApp(id:number,payload:AppCreatePayload){
  const res = await axios.put(`${process.env.NEXT_PUBLIC_API_SERVICE_USER}/v1/apps/${id}`, payload)
  return res.data
}

export async function deleteApp(id:number){
  const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_SERVICE_USER}/v1/apps/${id}`)
  return res.data
}
