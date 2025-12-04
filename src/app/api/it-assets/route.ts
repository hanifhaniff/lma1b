import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { itAssets } from "@/lib/db/schema";
import { desc, or, like, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');
    
    let assets;

    if (searchTerm) {
      const searchPattern = `%${searchTerm}%`;
      assets = await db.select().from(itAssets)
        .where(
          or(
            like(itAssets.nama, searchPattern),
            like(itAssets.pic, searchPattern),
            like(itAssets.serialNumber, searchPattern),
            like(itAssets.kategori, searchPattern),
            like(itAssets.nomorAsset, searchPattern),
            like(itAssets.nomorBast, searchPattern),
            like(itAssets.keterangan, searchPattern)
          )
        )
        .orderBy(desc(itAssets.createdAt));
    } else {
      assets = await db.select().from(itAssets).orderBy(desc(itAssets.createdAt));
    }
    
    // Map camelCase fields to snake_case for frontend
    const mappedAssets = assets.map(asset => ({
      id: asset.id,
      nama: asset.nama,
      pic: asset.pic,
      serial_number: asset.serialNumber,
      tanggal_diterima: asset.tanggalDiterima,
      kategori: asset.kategori,
      nomor_asset: asset.nomorAsset,
      nomor_bast: asset.nomorBast,
      keterangan: asset.keterangan,
      created_at: asset.createdAt,
      updated_at: asset.updatedAt,
    }));
    
    return Response.json(mappedAssets);
  } catch (error: unknown) {
    console.error('Unexpected error in GET /api/it-assets:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    
    const [newAsset] = await db.insert(itAssets).values({
      nama: body.nama,
      pic: body.pic,
      serialNumber: body.serial_number || body.serialNumber,
      kategori: body.kategori,
      nomorAsset: body.nomor_asset || body.nomorAsset,
      nomorBast: body.nomor_bast || body.nomorBast || null,
      tanggalDiterima: body.tanggal_diterima ? new Date(body.tanggal_diterima) : new Date(),
      keterangan: body.keterangan || null,
    }).$returningId();

    const [asset] = await db.select().from(itAssets).where(eq(itAssets.id, newAsset.id));
    
    // Map to frontend format
    const mappedAsset = {
      id: asset.id,
      nama: asset.nama,
      pic: asset.pic,
      serial_number: asset.serialNumber,
      tanggal_diterima: asset.tanggalDiterima,
      kategori: asset.kategori,
      nomor_asset: asset.nomorAsset,
      nomor_bast: asset.nomorBast,
      keterangan: asset.keterangan,
      created_at: asset.createdAt,
      updated_at: asset.updatedAt,
    };
    
    return Response.json(mappedAsset);
  } catch (error: unknown) {
    console.error('Unexpected error in POST /api/it-assets:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (errorMessage.includes('Duplicate entry')) {
      return Response.json({ error: 'Asset number already exists. Please use a unique asset number.' }, { status: 400 });
    }
    return Response.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return Response.json({ error: "IT asset ID is required" }, { status: 400 });
    }
    
    const updateValues: any = {};
    if (updateData.nama) updateValues.nama = updateData.nama;
    if (updateData.pic) updateValues.pic = updateData.pic;
    if (updateData.serial_number) updateValues.serialNumber = updateData.serial_number;
    if (updateData.kategori) updateValues.kategori = updateData.kategori;
    if (updateData.nomor_asset) updateValues.nomorAsset = updateData.nomor_asset;
    if (updateData.nomor_bast !== undefined) updateValues.nomorBast = updateData.nomor_bast || null;
    if (updateData.tanggal_diterima) updateValues.tanggalDiterima = new Date(updateData.tanggal_diterima);
    if (updateData.keterangan !== undefined) updateValues.keterangan = updateData.keterangan || null;
    
    await db.update(itAssets)
      .set(updateValues)
      .where(eq(itAssets.id, id));

    const [asset] = await db.select().from(itAssets).where(eq(itAssets.id, id));
    
    // Map to frontend format
    const mappedAsset = {
      id: asset.id,
      nama: asset.nama,
      pic: asset.pic,
      serial_number: asset.serialNumber,
      tanggal_diterima: asset.tanggalDiterima,
      kategori: asset.kategori,
      nomor_asset: asset.nomorAsset,
      nomor_bast: asset.nomorBast,
      keterangan: asset.keterangan,
      created_at: asset.createdAt,
      updated_at: asset.updatedAt,
    };
    
    return Response.json(mappedAsset);
  } catch (error: unknown) {
    console.error('Unexpected error in PUT /api/it-assets:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (errorMessage.includes('Duplicate entry')) {
      return Response.json({ error: 'Asset number already exists. Please use a unique asset number.' }, { status: 400 });
    }
    return Response.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAuth();

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return Response.json({ error: "IT asset ID is required" }, { status: 400 });
    }
    
    await db.delete(itAssets).where(eq(itAssets.id, id));
    
    return Response.json({ message: 'IT asset deleted successfully' });
  } catch (error: unknown) {
    console.error('Unexpected error in DELETE /api/it-assets:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}
