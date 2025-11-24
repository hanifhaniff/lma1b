import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { DoconSearchParams, generateDocumentNumber, formatSerialNumber } from "@/app/docon/monitorsd/types";
import { getNextSerialNumber, validateDocumentUniqueness } from "@/app/docon/monitorsd/utils";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 100;
    const offset = searchParams.get("offset") ? Number(searchParams.get("offset")) : 0;
    const search = searchParams.get("search") || "";

    // Get filter parameters
    const contractCode = searchParams.get("contract_code") || "";
    const documentType = searchParams.get("document_type") || "";
    const discipline = searchParams.get("discipline") || "";
    const location = searchParams.get("location") || "";
    const workSystem = searchParams.get("work_system") || "";
    const submissionStatus = searchParams.get("submission_status") || "";
    const workflowStatus = searchParams.get("document_workflow_status") || "";
    const dateFrom = searchParams.get("date_from") || "";
    const dateTo = searchParams.get("date_to") || "";

    // Special endpoint to get next serial number
    const getNextSerial = searchParams.get("get_next_serial") === "true";

    if (getNextSerial && contractCode && documentType && discipline && location && workSystem) {
      try {
        const result = await getNextSerialNumber({
          contract_code: contractCode,
          document_type: documentType,
          discipline: discipline,
          location: location,
          work_system: workSystem
        });

        return new Response(JSON.stringify({ 
          serial_number: result.serial_number,
          is_new_combination: result.is_new_combination,
          message: result.is_new_combination 
            ? 'New combination - starting from beginning' 
            : 'Existing combination - incrementing'
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Error getting next serial:", error);
        return new Response(
          JSON.stringify({ error: "Failed to get next serial number", details: (error as Error).message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    let query = supabase
      .from("docon_documents_view")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (contractCode) query = query.eq("contract_code", contractCode);
    if (documentType) query = query.eq("document_type", documentType);
    if (discipline) query = query.eq("discipline", discipline);
    if (location) query = query.eq("location", location);
    if (workSystem) query = query.eq("work_system", workSystem);
    if (submissionStatus) query = query.eq("submission_status", submissionStatus);
    if (workflowStatus) query = query.eq("document_workflow_status", workflowStatus);
    if (dateFrom) query = query.gte("date_received", dateFrom);
    if (dateTo) query = query.lte("date_received", dateTo);

    if (search && !contractCode && !documentType && !discipline && !location && !workSystem) {
      query = query.or(
        `document_number.ilike.%${search}%,title.ilike.%${search}%,pic.ilike.%${search}%,transmittal_no.ilike.%${search}%`
      );
    }

    const { data, error, status } = await query;

    if (error && status !== 406) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Database query failed", details: error.message }),
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
    if (!body.contract_code || !body.document_type || !body.discipline || 
        !body.location || !body.work_system || !body.title || !body.pic || !body.date_received) {
      return new Response(
        JSON.stringify({ error: "Required fields missing" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get next serial number if not provided
    let serialNumber = body.serial_number;
    let isNewCombination = false;
    
    if (!serialNumber) {
      try {
        const result = await getNextSerialNumber({
          contract_code: body.contract_code,
          document_type: body.document_type,
          discipline: body.discipline,
          location: body.location,
          work_system: body.work_system
        });
        serialNumber = result.serial_number;
        isNewCombination = result.is_new_combination;
      } catch (error) {
        console.error("Error getting next serial:", error);
        return new Response(
          JSON.stringify({ error: "Failed to generate serial number", details: (error as Error).message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const revisionNumber = body.revision_number || '0';

    // Generate document number
    const documentNumber = generateDocumentNumber({
      contract_code: body.contract_code,
      document_type: body.document_type,
      discipline: body.discipline,
      location: body.location,
      work_system: body.work_system,
      serial_number: serialNumber,
      revision_number: revisionNumber
    });

    // Validate uniqueness before inserting
    const validation = await validateDocumentUniqueness({
      contract_code: body.contract_code,
      document_type: body.document_type,
      discipline: body.discipline,
      location: body.location,
      work_system: body.work_system,
      serial_number: serialNumber,
      revision_number: revisionNumber
    });

    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error || "Document number already exists" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data, error, status } = await supabase
      .from("docon_documents")
      .insert([{
        contract_code: body.contract_code,
        document_type: body.document_type,
        discipline: body.discipline,
        location: body.location,
        work_system: body.work_system,
        serial_number: serialNumber,
        revision_number: revisionNumber,
        document_number: documentNumber,
        title: body.title,
        pic: body.pic,
        date_received: body.date_received,
        transmittal_no: body.transmittal_no,
        submission_status: body.submission_status || 'Draft',
        document_workflow_status: body.document_workflow_status,
        revision_review_code: body.revision_review_code,
        remarks: body.remarks,
        previous_revision_id: body.previous_revision_id,
        created_by: body.created_by
      }])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to create document",
          details: error.message,
          code: error.code
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create revision history record
    if (data.id) {
      await supabase.from("docon_revision_history").insert([{
        document_id: data.id,
        revision_number: revisionNumber,
        revision_date: body.date_received,
        revised_by: body.pic,
        changes_description: 'Initial document creation'
      }]);
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

    // Get current document data
    const { data: currentDoc } = await supabase
      .from("docon_documents")
      .select("*")
      .eq("id", body.id)
      .single();

    if (!currentDoc) {
      return new Response(
        JSON.stringify({ error: "Document not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if this is a revision update
    const isRevisionUpdate = body.revision_number && body.revision_number !== currentDoc.revision_number;

    // If document number components changed, regenerate document number
    let documentNumber = currentDoc.document_number;
    if (body.contract_code || body.document_type || body.discipline || 
        body.location || body.work_system || body.serial_number || body.revision_number) {
      documentNumber = generateDocumentNumber({
        contract_code: body.contract_code || currentDoc.contract_code,
        document_type: body.document_type || currentDoc.document_type,
        discipline: body.discipline || currentDoc.discipline,
        location: body.location || currentDoc.location,
        work_system: body.work_system || currentDoc.work_system,
        serial_number: body.serial_number || currentDoc.serial_number,
        revision_number: body.revision_number || currentDoc.revision_number
      });
    }

    const updateData: any = {
      title: body.title !== undefined ? body.title : currentDoc.title,
      pic: body.pic !== undefined ? body.pic : currentDoc.pic,
      date_received: body.date_received !== undefined ? body.date_received : currentDoc.date_received,
      transmittal_no: body.transmittal_no !== undefined ? body.transmittal_no : currentDoc.transmittal_no,
      submission_status: body.submission_status !== undefined ? body.submission_status : currentDoc.submission_status,
      document_workflow_status: body.document_workflow_status !== undefined ? body.document_workflow_status : currentDoc.document_workflow_status,
      revision_review_code: body.revision_review_code !== undefined ? body.revision_review_code : currentDoc.revision_review_code,
      remarks: body.remarks !== undefined ? body.remarks : currentDoc.remarks,
      updated_by: body.updated_by
    };

    if (documentNumber !== currentDoc.document_number) {
      updateData.document_number = documentNumber;
      updateData.contract_code = body.contract_code || currentDoc.contract_code;
      updateData.document_type = body.document_type || currentDoc.document_type;
      updateData.discipline = body.discipline || currentDoc.discipline;
      updateData.location = body.location || currentDoc.location;
      updateData.work_system = body.work_system || currentDoc.work_system;
      updateData.serial_number = body.serial_number || currentDoc.serial_number;
      updateData.revision_number = body.revision_number || currentDoc.revision_number;
    }

    const { data, error } = await supabase
      .from("docon_documents")
      .update(updateData)
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to update document",
          details: error.message
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Add revision history if this is a revision update
    if (isRevisionUpdate && body.changes_description) {
      await supabase.from("docon_revision_history").insert([{
        document_id: body.id,
        revision_number: body.revision_number,
        revision_date: body.date_received || new Date().toISOString().split('T')[0],
        revised_by: body.pic || body.updated_by,
        review_code: body.revision_review_code,
        review_comments: body.review_comments,
        reviewer_name: body.reviewer_name,
        review_date: body.review_date,
        changes_description: body.changes_description
      }]);
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
      .from("docon_documents")
      .delete()
      .eq("id", body.id);

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete document", details: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ message: "Document deleted successfully" }), {
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