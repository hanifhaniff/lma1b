import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get('kategori');
    
    if (!kategori) {
      return Response.json({ error: "Kategori is required" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    
    // Get all assets with the same kategori (regardless of date/prefix)
    const { data, error } = await supabase
      .from('it_assets')
      .select('nomor_asset')
      .eq('kategori', kategori)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching IT assets for next number:', error);
      return Response.json({ error: `Failed to get next number: ${error.message}` }, { status: 500 });
    }

    let nextNumber = 1;

    if (data && data.length > 0) {
      // Filter only assets that match the LMA.1B/IT template pattern
      // This excludes manual input like "HO-LAPTOP-001"
      const filteredData = data.filter(asset => 
        asset.nomor_asset && asset.nomor_asset.startsWith('LMA.1B/IT')
      );

      if (filteredData.length > 0) {
        // Extract numbers from existing asset numbers
        const numbers = filteredData
          .map(asset => {
            const parts = asset.nomor_asset.split('/');
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
    return Response.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}
