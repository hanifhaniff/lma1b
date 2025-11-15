import { NextRequest } from 'next/server';
import { updateStarlinkUsage, deleteStarlinkUsage } from '@/lib/starlink-usage';

// Get the ID from the route
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return Response.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    
    // Update the record
    const updatedUsage = await updateStarlinkUsage(id, {
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return Response.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const success = await deleteStarlinkUsage(id);

    if (!success) {
      return Response.json({ error: 'Failed to delete record' }, { status: 500 });
    }

    return Response.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting Starlink usage data:', error);
    return Response.json({ error: 'Failed to delete data' }, { status: 500 });
  }
}