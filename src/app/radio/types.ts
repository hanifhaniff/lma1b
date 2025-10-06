// Define the Radio type based on the database schema
export interface Radio {
  id: number;
  nama_radio: string;
  tipe_radio: string | null;
  serial_number: string;
  user_radio: string | null;
  nomor_bast: string | null;
  created_at: string; // ISO datetime string
}

// Define the type for creating a new radio
export interface NewRadio {
  nama_radio: string;
  tipe_radio?: string | null;
  serial_number: string;
  user_radio?: string | null;
  nomor_bast?: string | null;
}