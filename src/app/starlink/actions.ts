'use server';

import { db } from '@/lib/db';
import { starlinkUsage } from '@/lib/db/schema';
import { desc, gte, lte, and, sql } from 'drizzle-orm';

// Define types
interface StarlinkUsageByDateAndUnit {
  tanggal: string;
  [unit: string]: string | number;
}

interface MonthData {
  month: string;
}

interface RawUsageData {
  id: number;
  tanggal: string;
  unit_starlink: string;
  total_pemakaian: number;
}

// Get available months with data
export async function getAvailableMonths(): Promise<MonthData[]> {
  try {
    const result = await db
      .select({
        month: sql<string>`DATE_FORMAT(${starlinkUsage.tanggal}, '%Y-%m')`.as('month'),
      })
      .from(starlinkUsage)
      .groupBy(sql`DATE_FORMAT(${starlinkUsage.tanggal}, '%Y-%m')`)
      .orderBy(sql`DATE_FORMAT(${starlinkUsage.tanggal}, '%Y-%m')`);
    
    return result.map(r => ({ month: r.month }));
  } catch (error) {
    console.error('Error fetching available months:', error);
    return [];
  }
}

// Get all raw usage data
export async function getRawUsageData(): Promise<RawUsageData[]> {
  try {
    const usages = await db.select().from(starlinkUsage).orderBy(desc(starlinkUsage.tanggal));
    
    return usages.map(u => ({
      id: u.id,
      tanggal: u.tanggal.toISOString().split('T')[0],
      unit_starlink: u.unitStarlink,
      total_pemakaian: Number(u.totalPemakaian),
    }));
  } catch (error) {
    console.error('Error fetching raw usage data:', error);
    return [];
  }
}

// Get usage data grouped by date and unit for a specific month
export async function getUsageByDateAndUnit(
  startDate?: string,
  endDate?: string
): Promise<StarlinkUsageByDateAndUnit[]> {
  try {
    let query = db.select().from(starlinkUsage);
    
    if (startDate && endDate) {
      // Use DATE() function in SQL to compare only the date part, ignoring time
      query = query.where(
        sql`DATE(${starlinkUsage.tanggal}) >= ${startDate} AND DATE(${starlinkUsage.tanggal}) <= ${endDate}`
      ) as any;
    }
    
    const usages = await query.orderBy(starlinkUsage.tanggal);
    
    // Group by date and unit
    const grouped: Record<string, Record<string, number>> = {};
    
    usages.forEach(u => {
      const date = u.tanggal.toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = {};
      }
      grouped[date][u.unitStarlink] = Number(u.totalPemakaian);
    });
    
    // Convert to array format
    const result: StarlinkUsageByDateAndUnit[] = Object.keys(grouped)
      .sort()
      .map(date => ({
        tanggal: date,
        ...grouped[date],
      }));
    
    return result;
  } catch (error) {
    console.error('Error fetching usage by date and unit:', error);
    return [];
  }
}
