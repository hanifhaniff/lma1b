import { createSupabaseServerClient } from './supabase';

export interface StarlinkUsage {
  id: number;
  tanggal: string; // ISO date string
  unit_starlink: string;
  total_pemakaian: number;
  created_at?: string;
  updated_at?: string;
}

// Function to insert new Starlink usage data
export async function insertStarlinkUsage(usage: Omit<StarlinkUsage, 'id' | 'created_at' | 'updated_at'>): Promise<StarlinkUsage | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('starlink_usage')
    .insert([usage])
    .select()
    .single();

  if (error) {
    console.error('Error inserting Starlink usage:', error);
    throw error;
  }

  return data;
}

// Function to fetch Starlink usage data with optional filters
export async function getStarlinkUsage(filters?: {
  startDate?: string;
  endDate?: string;
  unit?: string;
  limit?: number;
}): Promise<StarlinkUsage[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('starlink_usage')
    .select('*')
    .order('tanggal', { ascending: false });

  if (filters?.startDate) {
    query = query.gte('tanggal', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('tanggal', filters.endDate);
  }
  if (filters?.unit) {
    query = query.eq('unit_starlink', filters.unit);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching Starlink usage:', error);
    throw error;
  }

  return data;
}

// Function to update Starlink usage data
export async function updateStarlinkUsage(id: number, usage: Partial<Omit<StarlinkUsage, 'id' | 'created_at' | 'updated_at'>>): Promise<StarlinkUsage | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('starlink_usage')
    .update({ ...usage, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating Starlink usage:', error);
    throw error;
  }

  return data;
}

// Function to delete Starlink usage data
export async function deleteStarlinkUsage(id: number): Promise<boolean> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from('starlink_usage')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting Starlink usage:', error);
    throw error;
  }

  return true;
}

// Function to aggregate Starlink usage by date
export async function getStarlinkUsageByDate(startDate?: string, endDate?: string): Promise<{tanggal: string, total_usage: number}[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('starlink_usage')
    .select('tanggal, total_pemakaian')
    .order('tanggal', { ascending: false });

  if (startDate) {
    query = query.gte('tanggal', startDate);
  }
  if (endDate) {
    query = query.lte('tanggal', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching Starlink usage for aggregation:', error);
    throw error;
  }

  // Group by date and sum the usage
  const groupedData: Record<string, number> = {};
  data.forEach(record => {
    if (groupedData[record.tanggal]) {
      groupedData[record.tanggal] += Number(record.total_pemakaian);
    } else {
      groupedData[record.tanggal] = Number(record.total_pemakaian);
    }
  });

  return Object.entries(groupedData).map(([tanggal, total_usage]) => ({
    tanggal,
    total_usage
  })).sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
}

// Function to aggregate Starlink usage by date and unit
export async function getStarlinkUsageByDateAndUnit(startDate?: string, endDate?: string): Promise<{tanggal: string, [key: string]: number | string}[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('starlink_usage')
    .select('tanggal, unit_starlink, total_pemakaian')
    .order('tanggal', { ascending: false });

  if (startDate) {
    query = query.gte('tanggal', startDate);
  }
  if (endDate) {
    query = query.lte('tanggal', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching Starlink usage for aggregation by unit:', error);
    throw error;
  }

  // Group by date and unit, aggregating the usage
  const groupedData: Record<string, Record<string, number>> = {};
  data.forEach(record => {
    const { tanggal, unit_starlink, total_pemakaian } = record;

    if (!groupedData[tanggal]) {
      groupedData[tanggal] = {};
    }

    if (groupedData[tanggal][unit_starlink]) {
      groupedData[tanggal][unit_starlink] += Number(total_pemakaian);
    } else {
      groupedData[tanggal][unit_starlink] = Number(total_pemakaian);
    }
  });

  // Convert to array format and sort by date
  const result = Object.entries(groupedData).map(([tanggal, unitsData]) => ({
    tanggal,
    ...unitsData
  }));

  return result.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()) as {tanggal: string, [key: string]: number | string}[];
}

// Function to aggregate Starlink usage by month
export async function getStarlinkUsageByMonth(startDate?: string, endDate?: string): Promise<{month: string, total_usage: number}[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('starlink_usage')
    .select('tanggal, total_pemakaian')
    .order('tanggal', { ascending: false });

  if (startDate) {
    query = query.gte('tanggal', startDate);
  }
  if (endDate) {
    query = query.lte('tanggal', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching Starlink usage for monthly aggregation:', error);
    throw error;
  }

  // Group by month and sum the usage
  const groupedData: Record<string, number> = {};
  data.forEach(record => {
    // Convert date string to month (YYYY-MM format)
    const date = new Date(record.tanggal);
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    // If we have date filters, only include months within the date range
    if (startDate || endDate) {
      const recordDate = new Date(record.tanggal);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if ((start && recordDate < start) || (end && recordDate > end)) {
        return; // Skip this record if it's outside the date range
      }
    }

    if (groupedData[month]) {
      groupedData[month] += Number(record.total_pemakaian);
    } else {
      groupedData[month] = Number(record.total_pemakaian);
    }
  });

  return Object.entries(groupedData).map(([month, total_usage]) => ({
    month,
    total_usage
  })).sort((a, b) => a.month.localeCompare(b.month));
}

// Function to aggregate Starlink usage by month and unit
export async function getStarlinkUsageByMonthAndUnit(startDate?: string, endDate?: string): Promise<{month: string, [key: string]: number | string}[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('starlink_usage')
    .select('tanggal, unit_starlink, total_pemakaian')
    .order('tanggal', { ascending: false });

  if (startDate) {
    query = query.gte('tanggal', startDate);
  }
  if (endDate) {
    query = query.lte('tanggal', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching Starlink usage for monthly aggregation by unit:', error);
    throw error;
  }

  // Group by month and unit, aggregating the usage
  const groupedData: Record<string, Record<string, number>> = {};
  data.forEach(record => {
    const { tanggal, unit_starlink, total_pemakaian } = record;
    // Convert date string to month (YYYY-MM format)
    const date = new Date(tanggal);
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    // If we have date filters, only include months within the date range
    if (startDate || endDate) {
      const recordDate = new Date(tanggal);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if ((start && recordDate < start) || (end && recordDate > end)) {
        return; // Skip this record if it's outside the date range
      }
    }

    if (!groupedData[month]) {
      groupedData[month] = {};
    }

    if (groupedData[month][unit_starlink]) {
      groupedData[month][unit_starlink] += Number(total_pemakaian);
    } else {
      groupedData[month][unit_starlink] = Number(total_pemakaian);
    }
  });

  // Convert to array format and sort by month
  const result = Object.entries(groupedData).map(([month, unitsData]) => ({
    month,
    ...unitsData
  }));

  return result.sort((a, b) => a.month.localeCompare(b.month)) as {month: string, [key: string]: number | string}[];
}

// Function to get unique Starlink units
export async function getStarlinkUnits(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('starlink_usage')
    .select('unit_starlink')
    .order('unit_starlink', { ascending: true });

  if (error) {
    console.error('Error fetching Starlink units:', error);
    throw error;
  }

  // Get unique units manually since distinct() might not be available
  const uniqueUnits = [...new Set(data.map((item: any) => item.unit_starlink))];
  return uniqueUnits;
}