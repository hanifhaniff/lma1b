import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { itAssets } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get('kategori');
    
    if (!kategori) {
      return Response.json({ error: "Kategori is required" }, { status: 400 });
    }
    
    // Get all assets with the same kategori (regardless of date/prefix)
    const data = await db.select({
      nomorAsset: itAssets.nomorAsset
    })
      .from(itAssets)
      .where(eq(itAssets.kategori, kategori))
      .orderBy(desc(itAssets.createdAt));

    let nextNumber = 1;

    if (data && data.length > 0) {
      // Filter only assets that match the LMA.1B/IT template pattern
      // This excludes manual input like "HO-LAPTOP-001"
      const filteredData = data.filter(asset => 
        asset.nomorAsset && asset.nomorAsset.startsWith('LMA.1B/IT')
      );

      if (filteredData.length > 0) {
        // Extract numbers from existing asset numbers
        const numbers = filteredData
          .map(asset => {
            const parts = asset.nomorAsset!.split('/');
            const lastPart = parts[parts.length - 1];
            return parseInt(lastPart, 10);
          })
          .filter(num => !isNaN(num))
          .sort((a, b) => b - a);

        if (numbers.length > 0) {
          nextNumber = numbers[0] + 1;
        }
      }
    }

    // Format number with leading zeros (3 digits)
    const formattedNumber = String(nextNumber).padStart(3, '0');

    return Response.json({ nextNumber: formattedNumber });
  } catch (error: unknown) {
    console.error('Unexpected error in GET /api/it-assets/next-number:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}
