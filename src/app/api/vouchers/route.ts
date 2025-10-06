import { NextRequest } from 'next/server';
import {
  getVouchers as getVouchersAction,
  getVoucherById as getVoucherByIdAction,
  createVoucher as createVoucherAction,
  updateVoucher as updateVoucherAction,
  deleteVoucher as deleteVoucherAction
} from '../../voucher/actions';
import { NewVoucher } from '../../voucher/types';

// GET /api/vouchers - Get all vouchers with optional search
export async function GET(request: NextRequest) {
  try {
    // Extract search parameter from query
    const { searchParams } = new URL(request.url);
    const searchNamaUser = searchParams.get('searchNamaUser');
    
    let vouchers = await getVouchersAction();
    
    // Filter on the server side if search parameter is provided
    if (searchNamaUser) {
      vouchers = vouchers.filter(voucher => 
        voucher.nama_user.toLowerCase().includes(searchNamaUser.toLowerCase())
      );
    }
    
    return new Response(JSON.stringify(vouchers), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch vouchers' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// POST /api/vouchers - Create a new voucher
export async function POST(request: NextRequest) {
  try {
    const voucherData: NewVoucher = await request.json();
    
    // Basic validation
    if (!voucherData.kode_voucher) {
      return new Response(
        JSON.stringify({ error: 'Kode voucher is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!voucherData.nama_user) {
      return new Response(
        JSON.stringify({ error: 'Nama user is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!voucherData.tipe_voucher) {
      return new Response(
        JSON.stringify({ error: 'Tipe voucher is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }



    // Tanggal kadaluarsa is now optional, so no validation needed

    const newVoucher = await createVoucherAction(voucherData);
    return new Response(JSON.stringify(newVoucher), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating voucher:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create voucher' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}