import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();
    
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');
    
    let query = supabase
      .from('it_assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (searchTerm) {
      const searchPattern = `%${searchTerm}%`;
      query = query.or(
        `nama.ilike.${searchPattern},pic.ilike.${searchPattern},serial_number.ilike.${searchPattern},kategori.ilike.${searchPattern},nomor_asset.ilike.${searchPattern},nomor_bast.ilike.${searchPattern}`
      );
    }
    
    const { data, error, status } = await query;
    
    if (error) {
      console.error('Error fetching IT assets:', error);
      
      let errorMessage = `Failed to fetch IT assets: ${error.message}`;
      if (status === 404 || error.code === '42P01') {
        errorMessage = 'IT assets table does not exist in the database. Please create the table first using the SQL schema provided.';
      } else if (error.code === '23505') {
        errorMessage = 'Database constraint error: ' + error.message;
      } else if (status === 401 || status === 403) {
        errorMessage = 'Authentication error: ' + error.message;
      }
      
      return Response.json({ error: errorMessage }, { status: status || 500 });
    }
    
    return Response.json(data || []);
  } catch (error: unknown) {
    console.error('Unexpected error in GET /api/it-assets:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const supabase = await createSupabaseServerClient();
    
    const { data, error, status } = await supabase
      .from('it_assets')
      .insert([body])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating IT asset:', error);
      
      let errorMessage = `Failed to create IT asset: ${error.message}`;
      if (error.code === '23505') {
        errorMessage = 'Asset number already exists. Please use a unique asset number.';
      }
      
      return Response.json({ error: errorMessage }, { status: status || 500 });
    }
    
    return Response.json(data);
  } catch (error: unknown) {
    console.error('Unexpected error in POST /api/it-assets:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return Response.json({ error: "IT asset ID is required" }, { status: 400 });
    }
    
    const supabase = await createSupabaseServerClient();
    
    const { data, error, status } = await supabase
      .from('it_assets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating IT asset:', error);
      
      let errorMessage = `Failed to update IT asset: ${error.message}`;
      if (error.code === '23505') {
        errorMessage = 'Asset number already exists. Please use a unique asset number.';
      }
      
      return Response.json({ error: errorMessage }, { status: status || 500 });
    }
    
    return Response.json(data);
  } catch (error: unknown) {
    console.error('Unexpected error in PUT /api/it-assets:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return Response.json({ error: "IT asset ID is required" }, { status: 400 });
    }
    
    const supabase = await createSupabaseServerClient();
    
    const { error, status } = await supabase
      .from('it_assets')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting IT asset:', error);
      return Response.json({ error: `Failed to delete IT asset: ${error.message}` }, { status: status || 500 });
    }
    
    return Response.json({ message: 'IT asset deleted successfully' });
  } catch (error: unknown) {
    console.error('Unexpected error in DELETE /api/it-assets:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}
