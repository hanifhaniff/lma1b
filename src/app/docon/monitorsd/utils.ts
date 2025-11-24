import { createSupabaseServerClient } from '@/lib/supabase';
import { getStartNumberForDocumentType, formatSerialNumber } from './types';

/**
 * Get the next serial number for a document combination.
 * If no documents exist with the same combination, it starts from 1 (or 501 for exception types).
 * 
 * @param params - Document combination parameters
 * @returns The next available serial number (3-digit format)
 */
export async function getNextSerialNumber(params: {
  contract_code: string;
  document_type: string;
  discipline: string;
  location: string;
  work_system: string;
}): Promise<{ serial_number: string; is_new_combination: boolean }> {
  const supabase = await createSupabaseServerClient();
  
  const { contract_code, document_type, discipline, location, work_system } = params;
  
  // Try to use the database function first
  try {
    const { data, error } = await supabase.rpc('get_next_serial_number', {
      p_contract_code: contract_code,
      p_document_type: document_type,
      p_discipline: discipline,
      p_location: location,
      p_work_system: work_system
    });

    if (!error && data) {
      // Check if this is a new combination
      const { count } = await supabase
        .from('docon_documents')
        .select('*', { count: 'exact', head: true })
        .eq('contract_code', contract_code)
        .eq('document_type', document_type)
        .eq('discipline', discipline)
        .eq('location', location)
        .eq('work_system', work_system);

      return {
        serial_number: data,
        is_new_combination: (count || 0) === 0
      };
    }
  } catch (err) {
    console.log('Database function not available, using fallback method');
  }

  // Fallback: Manual calculation
  const startNumber = getStartNumberForDocumentType(document_type);

  // Check if any documents exist with this exact combination
  const { data: existingDocs, error: queryError } = await supabase
    .from('docon_documents')
    .select('serial_number')
    .eq('contract_code', contract_code)
    .eq('document_type', document_type)
    .eq('discipline', discipline)
    .eq('location', location)
    .eq('work_system', work_system)
    .order('serial_number', { ascending: false })
    .limit(1);

  if (queryError) {
    throw new Error(`Failed to query documents: ${queryError.message}`);
  }

  // If no documents exist with this combination, start from the beginning
  if (!existingDocs || existingDocs.length === 0) {
    return {
      serial_number: formatSerialNumber(startNumber),
      is_new_combination: true
    };
  }

  // Get the highest serial number and increment
  const lastSerial = parseInt(existingDocs[0].serial_number, 10);
  const nextSerial = lastSerial + 1;

  return {
    serial_number: formatSerialNumber(nextSerial),
    is_new_combination: false
  };
}

/**
 * Validate that a document number combination is unique (no duplicates)
 * 
 * @param params - Document parameters
 * @param excludeId - Document ID to exclude from check (for updates)
 * @returns true if valid (no duplicates), false otherwise
 */
export async function validateDocumentUniqueness(params: {
  contract_code: string;
  document_type: string;
  discipline: string;
  location: string;
  work_system: string;
  serial_number: string;
  revision_number: string;
}, excludeId?: number): Promise<{ valid: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('docon_documents')
    .select('id, document_number')
    .eq('contract_code', params.contract_code)
    .eq('document_type', params.document_type)
    .eq('discipline', params.discipline)
    .eq('location', params.location)
    .eq('work_system', params.work_system)
    .eq('serial_number', params.serial_number)
    .eq('revision_number', params.revision_number);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) {
    return {
      valid: false,
      error: `Database error: ${error.message}`
    };
  }

  if (data && data.length > 0) {
    return {
      valid: false,
      error: `Duplicate document number: ${data[0].document_number} already exists`
    };
  }

  return { valid: true };
}

/**
 * Get all documents with the same base combination (different revisions)
 */
export async function getDocumentRevisions(params: {
  contract_code: string;
  document_type: string;
  discipline: string;
  location: string;
  work_system: string;
  serial_number: string;
}) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('docon_documents')
    .select('*')
    .eq('contract_code', params.contract_code)
    .eq('document_type', params.document_type)
    .eq('discipline', params.discipline)
    .eq('location', params.location)
    .eq('work_system', params.work_system)
    .eq('serial_number', params.serial_number)
    .order('revision_number', { ascending: false });

  if (error) {
    throw new Error(`Failed to get revisions: ${error.message}`);
  }

  return data || [];
}

/**
 * Check if a serial number is available for the given combination
 */
export async function isSerialNumberAvailable(params: {
  contract_code: string;
  document_type: string;
  discipline: string;
  location: string;
  work_system: string;
  serial_number: string;
}): Promise<boolean> {
  const supabase = await createSupabaseServerClient();

  const { count, error } = await supabase
    .from('docon_documents')
    .select('*', { count: 'exact', head: true })
    .eq('contract_code', params.contract_code)
    .eq('document_type', params.document_type)
    .eq('discipline', params.discipline)
    .eq('location', params.location)
    .eq('work_system', params.work_system)
    .eq('serial_number', params.serial_number);

  if (error) {
    console.error('Error checking serial availability:', error);
    return false;
  }

  return (count || 0) === 0;
}
