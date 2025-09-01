import axios from './axios'
import { RoleCreatePayload } from '@/types/role'

export async function listRoles(params?: any){
  const res = await axios.get(process.env.NEXT_PUBLIC_API_SERVICE_USER + '/v1/roles', { params })
  return res.data.data ?? res.data;
}

export async function getRole(id:number){
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_SERVICE_USER}/v1/roles/${id}`)
  return res.data?.data || res?.data
}

export async function createRole(payload:RoleCreatePayload){
  const res = await axios.post(process.env.NEXT_PUBLIC_API_SERVICE_USER + '/v1/roles', payload)
  return res.data
}

export async function updateRole(id:number,payload:RoleCreatePayload){
  const res = await axios.put(`${process.env.NEXT_PUBLIC_API_SERVICE_USER}/v1/roles/${id}`, payload)
  return res.data
}

export async function deleteRole(id:number){
  const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_SERVICE_USER}/v1/roles/${id}`)
  return res.data
}
