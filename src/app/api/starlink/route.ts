import { NextRequest } from 'next/server';
import {
  getStarlinkUsage,
  getStarlinkUsageByDate,
  getStarlinkUsageByDateAndUnit,
  getStarlinkUsageByMonth,
  getStarlinkUsageByMonthAndUnit,
  getStarlinkUnits,
  insertStarlinkUsage,
  updateStarlinkUsage,
  deleteStarlinkUsage
} from '@/lib/starlink-usage';

// Handle different HTTP methods for Starlink usage data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupBy = searchParams.get('groupBy');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const unit = searchParams.get('unit');
    const unitsParam = searchParams.get('units');

    if (groupBy === 'date') {
      // Return aggregated data grouped by date
      const data = await getStarlinkUsageByDate(startDate || undefined, endDate || undefined);
      return Response.json(data);
    } else if (groupBy === 'dateAndUnit') {
      // Return aggregated data grouped by date and unit
      const data = await getStarlinkUsageByDateAndUnit(startDate || undefined, endDate || undefined);
      return Response.json(data);
    } else if (groupBy === 'month') {
      // Return aggregated data grouped by month
      const data = await getStarlinkUsageByMonth(startDate || undefined, endDate || undefined);
      // Filter by month if specified
      if (searchParams.get('month')) {
        const monthFilter = searchParams.get('month');
        return Response.json(data.filter(item => item.month === monthFilter));
      }
      return Response.json(data);
    } else if (groupBy === 'monthAndUnit') {
      // Return aggregated data grouped by month and unit
      const data = await getStarlinkUsageByMonthAndUnit(startDate || undefined, endDate || undefined);
      // Filter by month if specified
      if (searchParams.get('month')) {
        const monthFilter = searchParams.get('month');
        return Response.json(data.filter(item => (item as any).month === monthFilter));
      }
      return Response.json(data);
    } else if (unitsParam === 'true') {
      // Return list of unique Starlink units
      const units = await getStarlinkUnits();
      return Response.json(units);
    } else {
      // Return raw data with optional filters
      const filters = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        unit: unit || undefined,
      };

      const data = await getStarlinkUsage(filters);
      return Response.json(data);
    }
  } catch (error) {
    console.error('Error fetching Starlink usage data:', error);
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.tanggal || !body.unit_starlink || body.total_pemakaian === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for duplicate unit on the same date
    const existingRecords = await getStarlinkUsage({
      startDate: body.tanggal,
      endDate: body.tanggal,
      unit: body.unit_starlink
    });

    if (existingRecords.length > 0) {
      return Response.json({
        error: `Duplicate entry: Unit "${body.unit_starlink}" already exists for date ${body.tanggal}`
      }, { status: 409 });
    }

    const newUsage = await insertStarlinkUsage({
      tanggal: body.tanggal,
      unit_starlink: body.unit_starlink,
      total_pemakaian: body.total_pemakaian,
    });

    return Response.json(newUsage, { status: 201 });
  } catch (error) {
    console.error('Error creating Starlink usage data:', error);
    return Response.json({ error: 'Failed to create data' }, { status: 500 });
  }
}