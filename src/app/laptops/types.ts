export interface Laptop {
  id: string;
  name: string;
  assigned_user?: string | null;
  serial_number: string;
  asset_number?: string | null;
  model_type?: string | null;
  no_bast?: string | null;
  date_received: Date;
  condition?: string | null;
  notes?: string | null;
  image_url?: string | null;
  created_at: Date;
}