export interface ShopDrawing {
  id: string;
  doc_number: string;
  contract_code: string | null;
  document_type: string | null;
  discipline: string | null;
  location: string | null;
  work_system: string | null;
  serial_number: string | null;
  title: string;
  pic: string | null;
  doc_received_date: string | null; // ISO date string
  revision_number: number;
  doc_status: string | null;
  doc_type: string | null;
  quantity: number;
  transmittal_number: string | null;
  delivery_status: string | null;
  notes: string | null;
  original_revision: string | null;
  revised_to: string | null;
  revision_status: string | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface ShopDrawingFormData {
  doc_number: string;
  contract_code: string;
  document_type: string;
  discipline: string;
  location: string;
  work_system: string;
  serial_number: string;
  title: string;
  pic: string;
  doc_received_date: string;
  revision_number: number;
  doc_status: string;
  doc_type: string;
  quantity: number;
  transmittal_number: string;
  delivery_status: string;
  notes: string;
  original_revision: string;
  revised_to: string;
  revision_status: string;
}