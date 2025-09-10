export interface User {
  pk_user_id: number;
  username: string;
  email: string;
  full_name: string;
  roles?: Array<{
    pk_role_id: number;
    name: string;
    description: string;
  }>;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  fk_employee_id?: number;
  fk_module_id?: number;
}
