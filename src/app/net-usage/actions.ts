'use server';

import { db } from '@/lib/db';
import { starlinkUsage } from '@/lib/db/schema';
import { eq, desc, and, ne } from 'drizzle-orm';
import { StarlinkUsage, NewStarlinkUsage } from './types';

// Fetch all starlink usage records
export async function getStarlinkUsages(): Promise<StarlinkUsage[]> {
  try {
    const usages = await db.select().from(starlinkUsage).orderBy(desc(starlinkUsage.tanggal));
    // Map the camelCase fields to snake_case for the frontend
    return usages.map(u => ({
      id: u.id,
      tanggal: u.tanggal.toISOString().split('T')[0],
      unit_starlink: u.unitStarlink,
      total_pemakaian: Number(u.totalPemakaian),
      created_at: u.createdAt?.toISOString() || '',
      updated_at: u.updatedAt?.toISOString() || '',
    }));
  } catch (error) {
    console.error('Error fetching starlink usage records:', error);
    throw error;
  }
}

// Fetch a single starlink usage record by id
export async function getStarlinkUsageById(id: number): Promise<StarlinkUsage | null> {
  try {
    const [result] = await db.select().from(starlinkUsage).where(eq(starlinkUsage.id, id)).limit(1);
    if (!result) return null;
    return {
      id: result.id,
      tanggal: result.tanggal.toISOString().split('T')[0],
      unit_starlink: result.unitStarlink,
      total_pemakaian: Number(result.totalPemakaian),
      created_at: result.createdAt?.toISOString() || '',
      updated_at: result.updatedAt?.toISOString() || '',
    };
  } catch (error) {
    console.error('Error fetching starlink usage record:', error);
    throw error;
  }
}

// Create a new starlink usage record
export async function createStarlinkUsage(usageData: NewStarlinkUsage): Promise<StarlinkUsage> {
  try {
    const [newUsage] = await db.insert(starlinkUsage).values({
      tanggal: new Date(usageData.tanggal),
      unitStarlink: usageData.unit_starlink,
      totalPemakaian: usageData.total_pemakaian.toString(),
    }).$returningId();
    const [result] = await db.select().from(starlinkUsage).where(eq(starlinkUsage.id, newUsage.id));
    return {
      id: result.id,
      tanggal: result.tanggal.toISOString().split('T')[0],
      unit_starlink: result.unitStarlink,
      total_pemakaian: Number(result.totalPemakaian),
      created_at: result.createdAt?.toISOString() || '',
      updated_at: result.updatedAt?.toISOString() || '',
    };
  } catch (error) {
    console.error('Error creating starlink usage record:', error);
    throw error;
  }
}

// Update an existing starlink usage record
export async function updateStarlinkUsage(id: number, updateData: Partial<NewStarlinkUsage>): Promise<StarlinkUsage> {
  try {
    const updateValues: any = {};
    if (updateData.tanggal) updateValues.tanggal = new Date(updateData.tanggal);
    if (updateData.unit_starlink) updateValues.unitStarlink = updateData.unit_starlink;
    if (updateData.total_pemakaian !== undefined) updateValues.totalPemakaian = updateData.total_pemakaian.toString();
    
    await db.update(starlinkUsage).set(updateValues).where(eq(starlinkUsage.id, id));
    const [result] = await db.select().from(starlinkUsage).where(eq(starlinkUsage.id, id));
    return {
      id: result.id,
      tanggal: result.tanggal.toISOString().split('T')[0],
      unit_starlink: result.unitStarlink,
      total_pemakaian: Number(result.totalPemakaian),
      created_at: result.createdAt?.toISOString() || '',
      updated_at: result.updatedAt?.toISOString() || '',
    };
  } catch (error) {
    console.error('Error updating starlink usage record:', error);
    throw error;
  }
}

// Check if a record already exists for the same date and unit
export async function checkDuplicateUsage(tanggal: string, unit_starlink: string, excludeId?: number): Promise<boolean> {
  try {
    const dateObj = new Date(tanggal);
    const conditions = excludeId !== undefined
      ? and(eq(starlinkUsage.tanggal, dateObj), eq(starlinkUsage.unitStarlink, unit_starlink), ne(starlinkUsage.id, excludeId))
      : and(eq(starlinkUsage.tanggal, dateObj), eq(starlinkUsage.unitStarlink, unit_starlink));
    
    const results = await db.select().from(starlinkUsage).where(conditions).limit(1);
    return results.length > 0;
  } catch (error) {
    console.error('Error checking duplicate usage:', error);
    return false; // Don't block operations on error
  }
}

// Delete a starlink usage record
export async function deleteStarlinkUsage(id: number): Promise<void> {
  try {
    await db.delete(starlinkUsage).where(eq(starlinkUsage.id, id));
  } catch (error) {
    console.error('Error deleting starlink usage record:', error);
    throw error;
  }
}