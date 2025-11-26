export interface ITAsset {
  id: string;
  nama: string;
  pic: string;
  serial_number: string;
  tanggal_diterima: Date;
  kategori: string;
  nomor_asset: string;
  nomor_bast?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ITAssetFormData {
  nama: string;
  pic: string;
  serial_number: string;
  tanggal_diterima: Date | string;
  kategori: string;
  nomor_asset: string;
  nomor_bast?: string;
}
