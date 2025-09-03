export type AccessItem = {
  pk_modulerole_id: number;
  fk_module_id: number;
  fk_role_id: number;
  is_view?: boolean;
  is_add?: boolean;
  is_detail?: boolean;
  is_update?: boolean;
  is_delete?: boolean;
  is_approval?: boolean;
  is_activation?: boolean;
  module?: any; // nested module object
}

export type AccessCreatePayload = {
  fk_module_id: number;
  fk_role_id: number;
  is_view?: boolean;
  is_add?: boolean;
  is_detail?: boolean;
  is_update?: boolean;
  is_delete?: boolean;
  is_approval?: boolean;
  is_activation?: boolean;
}
