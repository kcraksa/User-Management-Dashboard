export type AppItem = {
  pk_app_id: number;
  name: string;
  key: string;
  description?: string | null;
  active?: boolean;
}

export type AppCreatePayload = {
  name: string;
  key: string;
  description?: string | null;
  active?: boolean;
}
