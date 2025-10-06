import { NextRequest } from 'next/server';
import { 
  getVoucherById as getVoucherByIdAction,
  updateVoucher as updateVoucherAction,
  deleteVoucher as deleteVoucherAction
} from '../../../voucher/actions';
import { Voucher } from '../../../voucher/types';

// Dynamic segment for voucher ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: kode_voucher } = params;
    
    if (!kode_voucher) {
      return new Response(
        JSON.stringify({ error: 'Voucher ID is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const voucher = await getVoucherByIdAction(kode_voucher);
    
    if (!voucher) {
      return new Response(
        JSON.stringify({ error: 'Voucher not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(JSON.stringify(voucher), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching voucher:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch voucher' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// PUT /api/vouchers/[id] - Update a voucher
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: kode_voucher } = params;
    const updateData = await request.json();
    
    if (!kode_voucher) {
      return new Response(
        JSON.stringify({ error: 'Voucher ID is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Update the voucher
    const updatedVoucher = await updateVoucherAction(kode_voucher, updateData);
    
    return new Response(JSON.stringify(updatedVoucher), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error updating voucher:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update voucher' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// DELETE /api/vouchers/[id] - Delete a voucher
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: kode_voucher } = params;
    
    if (!kode_voucher) {
      return new Response(
        JSON.stringify({ error: 'Voucher ID is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    await deleteVoucherAction(kode_voucher);
    
    return new Response(JSON.stringify({ message: 'Voucher deleted successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error deleting voucher:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete voucher' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}