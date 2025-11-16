import { NextRequest } from 'next/server';
import { updateStarlinkUsage, deleteStarlinkUsage, getStarlinkUsage } from '@/lib/starlink-usage';

// Get the ID from the route
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return Response.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();

    // Check for duplicate unit on the same date (excluding current record)
    const existingRecords = await getStarlinkUsage({
      startDate: body.tanggal,
      endDate: body.tanggal,
      unit: body.unit_starlink
    });

    // Check if there's a duplicate, excluding the current record being updated
    const duplicateRecord = existingRecords.find(record => record.id !== numericId);
    if (duplicateRecord) {
      return Response.json({
        error: `Duplicate entry: Unit "${body.unit_starlink}" already exists for date ${body.tanggal}`
      }, { status: 409 });
    }

    // Update the record
    const updatedUsage = await updateStarlinkUsage(numericId, {
      tanggal: body.tanggal,
      unit_starlink: body.unit_starlink,
      total_pemakaian: body.total_pemakaian,
    });

    if (!updatedUsage) {
      return Response.json({ error: 'Record not found' }, { status: 404 });
    }

    return Response.json(updatedUsage);
  } catch (error) {
    console.error('Error updating Starlink usage data:', error);
    return Response.json({ error: 'Failed to update data' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return Response.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const success = await deleteStarlinkUsage(numericId);

    if (!success) {
      return Response.json({ error: 'Failed to delete record' }, { status: 500 });
    }

    return Response.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting Starlink usage data:', error);
    return Response.json({ error: 'Failed to delete data' }, { status: 500 });
  }
}