// ====================================================================
// DOCUMENT CONTROL SYSTEM - TYPE DEFINITIONS
// ====================================================================

// Configuration Constants
export const DOCON_CONFIG = {
  separator: '-',
  serialSeparator: '.',
  defaultSerialStart: 1,
  exceptionSerialStart: 501,
  exceptionTypes: ['LET', 'MOM', 'RED', 'REP', 'REW', 'REM', 'RFC'],
} as const;

// Contract Codes
export const CONTRACT_CODES = {
  '160': 'Semua Area Proyek (Kecuali Jembatan)',
  '161': 'Jembatan Loa Hulu',
  '162': 'Jembatan Long Jo',
} as const;

// Document Types with Start Number Rules
export const DOCUMENT_TYPES = {
  AFM: { desc: 'Approval For Material', startNumber: 1 },
  BAL: { desc: 'Berita Acara Lapangan', startNumber: 1 },
  BAP: { desc: 'Berita Acara Pembayaran', startNumber: 1 },
  CAL: { desc: 'Calculation', startNumber: 1 },
  COM: { desc: 'Commercial', startNumber: 1 },
  DWG: { desc: 'Drawing', startNumber: 1 },
  EST: { desc: 'Estimate', startNumber: 1 },
  FAT: { desc: 'Final Acceptance Test', startNumber: 1 },
  ITP: { desc: 'Inspection Test Plan', startNumber: 1 },
  LET: { desc: 'Letter', startNumber: 501 },
  MOM: { desc: 'Minutes of Meeting', startNumber: 501 },
  PER: { desc: 'Permit', startNumber: 1 },
  PRE: { desc: 'Presentation', startNumber: 1 },
  RED: { desc: 'Report Daily', startNumber: 501 },
  REP: { desc: 'Report', startNumber: 501 },
  REW: { desc: 'Report Weekly', startNumber: 501 },
  REM: { desc: 'Report Monthly', startNumber: 501 },
  RFA: { desc: 'Request For Approval', startNumber: 1 },
  RFC: { desc: 'Report Fuel Consumption', startNumber: 501 },
  RFI: { desc: 'Request For Information', startNumber: 1 },
  RFQ: { desc: 'Request For Quotation', startNumber: 1 },
  RFW: { desc: 'Request For Work', startNumber: 1 },
  SCH: { desc: 'Schedule', startNumber: 1 },
  SOW: { desc: 'Scope of Work', startNumber: 1 },
  SPE: { desc: 'Specification', startNumber: 1 },
  TEV: { desc: 'Technical Evaluation', startNumber: 1 },
  WMS: { desc: 'Work Method Statement', startNumber: 1 },
  SOP: { desc: 'Standar Operational Procedure', startNumber: 1 },
  INK: { desc: 'Instruksi Kerja', startNumber: 1 },
  MKD: { desc: 'Manual Keadaan Darurat', startNumber: 1 },
  INT: { desc: 'Internal Memo', startNumber: 1 },
  IBPR: { desc: 'Identifikasi Bahaya dan Penilaian Resiko', startNumber: 1 },
} as const;

// Disciplines
export const DISCIPLINES = {
  ARC: 'Architectural, Landscaping',
  CIV: 'Civil',
  CTR: 'Instrumentation & Control',
  GEN: 'General',
  GEO: 'Geotechnical',
  MEP: 'Mechanical, Electrical, Plumbing',
  STR: 'Structural',
  TEL: 'Telecommunication',
  HYD: 'Hydrology',
} as const;

// Locations
export const LOCATIONS = {
  '01': { desc: 'General', sta: '-' },
  '05': { desc: 'Section 1', sta: '90+335 - 115+000' },
  '07': { desc: 'Section 2', sta: '115+000 - 126+425' },
} as const;

// Work System Ranges
export const WORK_SYSTEM_RANGES = {
  general: { range: [1, 9], desc: 'Work Detail of General' },
  civil_arch: { range: [11, 19], desc: 'Work Detail of Civil, Architecture, Landscape' },
  struct_inst: { range: [21, 29], desc: 'Work Detail of Structure, Instrument & Control' },
  mep: { range: [31, 39], desc: 'Work Detail of Mechanical, Electrical, Plumbing' },
  qc: { range: [41, 49], desc: 'Work Detail of Quality Control' },
  spare1: { range: [51, 59], desc: 'Spare 1' },
  spare2: { range: [61, 69], desc: 'Spare 2' },
  spare3: { range: [71, 79], desc: 'Spare 3' },
  spare4: { range: [81, 89], desc: 'Spare 4' },
  spare5: { range: [91, 99], desc: 'Spare 5' },
} as const;

// Submission Status Options
export const SUBMISSION_STATUS = [
  'Draft',
  'Submitted',
  'Received',
  'Distributed',
  'Closed',
] as const;

// Document Workflow Status
export const DOCUMENT_WORKFLOW_STATUS = {
  IFA: 'Issued For Approval',
  IFC: 'Issued For Construction',
  IFI: 'Issued For Information',
  ABT: 'As-Built',
} as const;

// Revision Review Codes
export const REVISION_REVIEW_CODES = {
  A: 'Approved (No Comments)',
  B: 'Approved with Comments',
  C: 'Revise & Resubmit',
  D: 'Rejected',
} as const;

// ====================================================================
// TYPE DEFINITIONS
// ====================================================================

export type ContractCode = keyof typeof CONTRACT_CODES;
export type DocumentTypeCode = keyof typeof DOCUMENT_TYPES;
export type DisciplineCode = keyof typeof DISCIPLINES;
export type LocationCode = keyof typeof LOCATIONS;
export type SubmissionStatus = typeof SUBMISSION_STATUS[number];
export type DocumentWorkflowStatus = keyof typeof DOCUMENT_WORKFLOW_STATUS;
export type RevisionReviewCode = keyof typeof REVISION_REVIEW_CODES;

// Main Document Interface
export interface DoconDocument {
  id: number;
  
  // Document Numbering Components
  contract_code: string;
  document_type: string;
  discipline: string;
  location: string;
  work_system: string;
  serial_number: string;
  revision_number: string;
  
  // Generated Document Number
  document_number: string;
  
  // Document Metadata
  title: string;
  pic: string;
  date_received: string; // ISO date string
  transmittal_no?: string | null;
  
  // Status Fields
  submission_status: string;
  document_workflow_status?: string | null;
  revision_review_code?: string | null;
  
  // Additional Information
  remarks?: string | null;
  
  // Revision Tracking
  previous_revision_id?: number | null;
  
  // Audit Fields
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

// Document with relations (from view)
export interface DoconDocumentWithRelations extends DoconDocument {
  file_count: number;
  revision_count: number;
  previous_revision_number?: string | null;
  previous_revision_title?: string | null;
}

// New Document Input
export interface NewDoconDocument {
  contract_code: string;
  document_type: string;
  discipline: string;
  location: string;
  work_system: string;
  serial_number?: string; // Optional, can be auto-generated
  revision_number?: string; // Default '0'
  
  title: string;
  pic: string;
  date_received: string;
  transmittal_no?: string;
  
  submission_status?: string;
  document_workflow_status?: string;
  revision_review_code?: string;
  
  remarks?: string;
  previous_revision_id?: number;
  
  created_by?: string;
}

// Update Document Input
export interface UpdateDoconDocument extends Partial<NewDoconDocument> {
  id: number;
  updated_by?: string;
}

// Document File Interface
export interface DoconDocumentFile {
  id: number;
  document_id: number;
  
  file_key: string;
  file_name: string;
  file_size?: number | null;
  file_type?: string | null;
  file_url?: string | null;
  
  file_category: 'current' | 'previous' | 'attachment';
  
  uploaded_at: string;
  uploaded_by?: string | null;
}

// New Document File Input
export interface NewDoconDocumentFile {
  document_id: number;
  file_key: string;
  file_name: string;
  file_size?: number;
  file_type?: string;
  file_url?: string;
  file_category?: 'current' | 'previous' | 'attachment';
  uploaded_by?: string;
}

// Revision History Interface
export interface DoconRevisionHistory {
  id: number;
  document_id: number;
  
  revision_number: string;
  revision_date: string;
  revised_by?: string | null;
  
  review_code?: string | null;
  review_comments?: string | null;
  reviewer_name?: string | null;
  review_date?: string | null;
  
  changes_description?: string | null;
  
  created_at: string;
}

// New Revision History Input
export interface NewDoconRevisionHistory {
  document_id: number;
  revision_number: string;
  revision_date: string;
  revised_by?: string;
  review_code?: string;
  review_comments?: string;
  reviewer_name?: string;
  review_date?: string;
  changes_description?: string;
}

// Form Data for Document Creation
export interface DoconDocumentFormData {
  // Basic Info
  contract_code: string;
  document_type: string;
  discipline: string;
  location: string;
  work_system: string;
  
  // Document Details
  title: string;
  pic: string;
  date_received: string;
  transmittal_no: string;
  
  // Status
  submission_status: string;
  document_workflow_status: string;
  revision_review_code?: string;
  
  // Additional
  remarks?: string;
  
  // Revision (for updates)
  revision_number?: string;
  previous_revision_id?: number;
  changes_description?: string;
}

// Search/Filter Parameters
export interface DoconSearchParams {
  search?: string;
  contract_code?: string;
  document_type?: string;
  discipline?: string;
  location?: string;
  submission_status?: string;
  document_workflow_status?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

// Helper function to format location and work system (remove leading zeros)
export function formatLocationWorkSystem(location: string, work_system: string): string {
  const locationNum = parseInt(location, 10);
  const workSystemNum = parseInt(work_system, 10);
  return `${locationNum}.${workSystemNum}`;
}

// Helper function to generate document number
export function generateDocumentNumber(params: {
  contract_code: string;
  document_type: string;
  discipline: string;
  location: string;
  work_system: string;
  serial_number: string;
  revision_number: string;
}): string {
  const formattedLocationWorkSystem = formatLocationWorkSystem(params.location, params.work_system);
  return `${params.contract_code}${DOCON_CONFIG.separator}${params.document_type}${DOCON_CONFIG.separator}${params.discipline}${DOCON_CONFIG.separator}${formattedLocationWorkSystem}${DOCON_CONFIG.separator}${params.revision_number}`;
}

// Helper function to get start number for document type
export function getStartNumberForDocumentType(documentType: string): number {
  if (DOCON_CONFIG.exceptionTypes.includes(documentType as any)) {
    return DOCON_CONFIG.exceptionSerialStart;
  }
  return DOCON_CONFIG.defaultSerialStart;
}

// Helper function to format serial number
export function formatSerialNumber(num: number): string {
  return num.toString().padStart(3, '0');
}

// Helper function to validate work system range
export function validateWorkSystemRange(workSystem: string, discipline: string): boolean {
  const wsNum = parseInt(workSystem, 10);
  if (isNaN(wsNum) || wsNum < 1 || wsNum > 99) {
    return false;
  }
  return true;
}
