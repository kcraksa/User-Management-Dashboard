import axios from './axios'

export type RolePermissions = {
  is_view?: boolean
  is_add?: boolean
  is_detail?: boolean
  is_update?: boolean
  is_delete?: boolean
  is_approval?: boolean
  is_activation?: boolean
}

export async function getMyPermissions(moduleId?: number){
  // hits /v1/auth/check for user and then /v1/module-to-role?fk_module_id=..
  // but backend provides module-role mapping via /v1/module-to-role
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_SERVICE_USER}/v1/module-to-role`, { params: { fk_module_id: moduleId } })
  return res.data?.data?.data ?? res.data?.data ?? res.data
}
