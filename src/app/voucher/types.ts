// Define the Voucher type based on the database schema
export interface Voucher {
  kode_voucher: string;
  nama_user: string;
  tipe_voucher: string;
  divisi: string | null;
  status: 'aktif' | 'digunakan' | 'kadaluarsa';
  tanggal_kadaluarsa: string | null; // ISO date string or null
  dibuat_pada: string; // ISO datetime string
}

// Define the type for creating a new voucher
export interface NewVoucher {
  kode_voucher: string;
  nama_user: string;
  tipe_voucher: string;
  divisi?: string | null;
  status?: 'aktif' | 'digunakan' | 'kadaluarsa';
  tanggal_kadaluarsa: string | null; // ISO date string or null
}