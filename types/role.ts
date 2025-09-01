export type RoleItem = {
  pk_role_id: number;
  name: string;
  fk_apps_id?: number;
  app?: any;
  description?: string | null;
  active?: boolean;
  created_date?: string | null;
  updated_date?: string | null;
}

export type RoleCreatePayload = {
  name: string;
  fk_apps_id?: number;
  description?: string | null;
  active?: boolean;
}
