export type MenuItem = {
  pk_module_id: number
  name: string
  url?: string
  url_view?: string
  url_create?: string
  url_update?: string
  url_detail?: string
  url_delete?: string
  url_approval?: string
  url_activation?: string
  parent_id?: number | null
  fk_parent_id?: number | null
  parent?: MenuItem | null
  children?: MenuItem[]
  icon?: string | null
  ordering?: number | null
  active?: boolean
  description?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type MenuCreatePayload = {
  name: string
  url?: string
  description?: string | null
  parent_id?: number | null
  icon?: string | null
  active?: boolean
}
