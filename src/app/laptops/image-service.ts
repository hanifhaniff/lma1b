"use server";

import { createSupabaseServerClient } from "@/lib/supabase";

export async function uploadLaptopImage(file: File, laptopId: string): Promise<string> {
  const supabase = await createSupabaseServerClient();
  
  // Generate a unique filename
  const fileName = `laptops/${laptopId}/${Date.now()}_${file.name}`;
  
  const { data, error } = await supabase
    .storage
    .from('laptop_images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
  
  // Get the public URL for the uploaded image
  const { data: publicData } = supabase
    .storage
    .from('laptop_images')
    .getPublicUrl(fileName);
  
  return publicData?.publicUrl || '';
}

export async function deleteLaptopImage(imageUrl: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  
  // Extract the path from the URL to delete the file
  const path = new URL(imageUrl).pathname.split('/').slice(3).join('/'); // Remove origin and bucket name
  
  const { error } = await supabase
    .storage
    .from('laptop_images')
    .remove([path]);
  
  if (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
}