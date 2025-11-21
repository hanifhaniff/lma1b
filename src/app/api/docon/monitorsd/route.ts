import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { ShopDrawing } from "@/lib/types/shop-drawing";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 100;
    const offset = searchParams.get("offset") ? Number(searchParams.get("offset")) : 0;
    const search = searchParams.get("search") || "";

    // Get filter parameters for auto-generating serial number
    const contractCode = searchParams.get("contract_code") || "";
    const documentType = searchParams.get("document_type") || "";
    const discipline = searchParams.get("discipline") || "";
    const location = searchParams.get("location") || "";
    const workSystem = searchParams.get("work_system") || "";

    console.log('API - Filter parameters:', {
      contractCode,
      documentType,
      discipline,
      location,
      workSystem
    });

    let query = supabase
      .from("shop_drawings")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters based on query parameters
    if (contractCode) {
      query = query.eq("contract_code", contractCode);
    }
    if (documentType) {
      query = query.eq("document_type", documentType);
    }
    if (discipline) {
      query = query.eq("discipline", discipline);
    }
    if (location) {
      query = query.eq("location", location);
    }
    if (workSystem) {
      query = query.eq("work_system", workSystem);
    }

    if (search && !contractCode && !documentType && !discipline && !location && !workSystem) {
      // Only apply general search if no specific filters are applied
      query = query.or(
        `doc_number.ilike.%${search}%,title.ilike.%${search}%,pic.ilike.%${search}%`
      );
    }

    const { data, error, status } = await query;

    console.log('API - Query result:', { data, error, status });

    if (error && status !== 406) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Database query failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data || []), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();

    // Validate required fields
    if (!body.doc_number || !body.title) {
      return new Response(
        JSON.stringify({ error: "Document number and title are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data, error, status } = await supabase
      .from("shop_drawings")
      .insert([{
        doc_number: body.doc_number,
        contract_code: body.contract_code,
        document_type: body.document_type,
        discipline: body.discipline,
        location: body.location,
        work_system: body.work_system,
        serial_number: body.serial_number,
        title: body.title,
        pic: body.pic,
        doc_received_date: body.doc_received_date,
        revision_number: body.revision_number !== undefined ? body.revision_number : 1,
        doc_status: body.doc_status,
        doc_type: body.doc_type,
        quantity: body.quantity || 0,
        transmittal_number: body.transmittal_number,
        delivery_status: body.delivery_status,
        notes: body.notes,
        original_revision: body.original_revision,
        revised_to: body.revised_to,
        revision_status: body.revision_status,
      }])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return new Response(
        JSON.stringify({
          error: "Failed to create shop drawing",
          details: error.message,
          code: error.code
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();

    if (!body.id) {
      return new Response(
        JSON.stringify({ error: "ID is required for updating" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate required fields
    if (!body.doc_number || !body.title) {
      return new Response(
        JSON.stringify({ error: "Document number and title are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data, error, status } = await supabase
      .from("shop_drawings")
      .update({
        doc_number: body.doc_number,
        contract_code: body.contract_code,
        document_type: body.document_type,
        discipline: body.discipline,
        location: body.location,
        work_system: body.work_system,
        serial_number: body.serial_number,
        title: body.title,
        pic: body.pic,
        doc_received_date: body.doc_received_date,
        revision_number: body.revision_number !== undefined ? body.revision_number : 1,
        doc_status: body.doc_status,
        doc_type: body.doc_type,
        quantity: body.quantity || 0,
        transmittal_number: body.transmittal_number,
        delivery_status: body.delivery_status,
        notes: body.notes,
        original_revision: body.original_revision,
        revised_to: body.revised_to,
        revision_status: body.revision_status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return new Response(
        JSON.stringify({
          error: "Failed to update shop drawing",
          details: error.message,
          code: error.code
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();

    if (!body.id) {
      return new Response(
        JSON.stringify({ error: "ID is required for deletion" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { error } = await supabase
      .from("shop_drawings")
      .delete()
      .eq("id", body.id);

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete shop drawing" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ message: "Shop drawing deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}