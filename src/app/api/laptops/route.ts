import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated via Clerk
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();
    
    // Add additional error logging to debug
    console.log("Attempting to fetch laptops...");
    const { data, error, status } = await supabase
      .from('laptops')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log("Supabase response:", { data, error, status });
    
    if (error) {
      console.error('Error fetching laptops:', error);
      console.error('Error details:', { message: error.message, code: error.code, status });
      
      // Provide more specific error message for common issues
      let errorMessage = `Failed to fetch laptops: ${error.message}`;
      if (status === 404 || error.code === '42P01') { // 42P01 is "undefined_table" in PostgreSQL
        errorMessage = 'Laptops table does not exist in the database. Please create the table first.';
      } else if (error.code === '23505') { // unique_violation
        errorMessage = 'Database constraint error: ' + error.message;
      } else if (status === 401 || status === 403) {
        errorMessage = 'Authentication error: ' + error.message;
      }
      
      return Response.json({ error: errorMessage }, { status: status || 500 });
    }
    
    console.log(`Successfully fetched ${data?.length || 0} laptops`);
    return Response.json(data || []);
  } catch (error: unknown) {
    console.error('Unexpected error in GET /api/laptops:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated via Clerk
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const supabase = await createSupabaseServerClient();
    
    console.log("Attempting to create laptop with data:", body);
    const { data, error, status } = await supabase
      .from('laptops')
      .insert([body])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating laptop:', error);
      console.error('Error details:', { message: error.message, code: error.code, status });
      return Response.json({ error: `Failed to create laptop: ${error.message}` }, { status: status || 500 });
    }
    
    console.log("Successfully created laptop:", data);
    return Response.json(data);
  } catch (error: unknown) {
    console.error('Unexpected error in POST /api/laptops:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify user is authenticated via Clerk
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return Response.json({ error: "Laptop ID is required" }, { status: 400 });
    }
    
    const supabase = await createSupabaseServerClient();
    
    console.log("Attempting to update laptop with id:", id, "and data:", updateData);
    const { data, error, status } = await supabase
      .from('laptops')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating laptop:', error);
      console.error('Error details:', { message: error.message, code: error.code, status });
      return Response.json({ error: `Failed to update laptop: ${error.message}` }, { status: status || 500 });
    }
    
    console.log("Successfully updated laptop:", data);
    return Response.json(data);
  } catch (error: unknown) {
    console.error('Unexpected error in PUT /api/laptops:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify user is authenticated via Clerk
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return Response.json({ error: "Laptop ID is required" }, { status: 400 });
    }
    
    const supabase = await createSupabaseServerClient();
    
    console.log("Attempting to delete laptop with id:", id);
    const { error, status } = await supabase
      .from('laptops')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting laptop:', error);
      console.error('Error details:', { message: error.message, code: error.code, status });
      return Response.json({ error: `Failed to delete laptop: ${error.message}` }, { status: status || 500 });
    }
    
    console.log("Successfully deleted laptop with id:", id);
    return Response.json({ message: 'Laptop deleted successfully' });
  } catch (error: unknown) {
    console.error('Unexpected error in DELETE /api/laptops:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}