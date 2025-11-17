// Define the StarlinkUsage type based on the database schema
export interface StarlinkUsage {
  id: number;
  tanggal: string; // ISO date string
  unit_starlink: string;
  total_pemakaian: number;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

// Define the type for creating a new starlink usage record
export interface NewStarlinkUsage {
  tanggal: string; // ISO date string
  unit_starlink: string;
  total_pemakaian: number;
}