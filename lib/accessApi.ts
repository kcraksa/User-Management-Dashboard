import axios from './axios'
import { AccessItem, AccessCreatePayload } from '@/types/access'

export async function listAccess(params?: any){
  const res = await axios.get(process.env.NEXT_PUBLIC_API_SERVICE_USER + '/v1/module-to-role', { params })
  return res.data.data || res.data
}

export async function getAccess(id:number){
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_SERVICE_USER}/v1/module-to-role/${id}`)
  return res.data?.data || res?.data
}

export async function createAccess(payload:AccessCreatePayload){
  const res = await axios.post(process.env.NEXT_PUBLIC_API_SERVICE_USER + '/v1/module-to-role', payload)
  return res.data
}

export async function updateAccess(id:number,payload:AccessCreatePayload){
  const res = await axios.put(`${process.env.NEXT_PUBLIC_API_SERVICE_USER}/v1/module-to-role/${id}`, payload)
  return res.data
}

export async function deleteAccess(id:number){
  const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_SERVICE_USER}/v1/module-to-role/${id}`)
  return res.data
}
