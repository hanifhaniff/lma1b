import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated via Clerk
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const laptopId = formData.get('laptopId') as string | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (!laptopId) {
      return Response.json({ error: "Laptop ID is required" }, { status: 400 });
    }

    // Validate file type (only allow images)
    if (!file.type.startsWith('image/')) {
      return Response.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    
    // Generate a unique filename
    const fileName = `laptops/${laptopId}/${Date.now()}_${file.name}`;
    
    console.log("Attempting to upload file:", fileName);
    const { data, error } = await supabase
      .storage
      .from('laptop_images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      console.error('Error details:', { message: error.message });
      
      let errorMessage = `Failed to upload image: ${error.message}`;
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        errorMessage = 'Authentication error during upload';
      } else if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        errorMessage = 'File with this name already exists';
      }
      
      return Response.json({ error: errorMessage }, { status: 500 });
    }
    
    console.log("Successfully uploaded file:", fileName);
    
    // Get the public URL for the uploaded image
    const { data: publicData } = supabase
      .storage
      .from('laptop_images')
      .getPublicUrl(fileName);
    
    console.log("Generated public URL:", publicData?.publicUrl);
    
    if (!publicData?.publicUrl) {
      return Response.json({ error: "Failed to generate public URL" }, { status: 500 });
    }
    
    return Response.json({ url: publicData.publicUrl });
  } catch (error: unknown) {
    console.error('Unexpected error in image upload:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}