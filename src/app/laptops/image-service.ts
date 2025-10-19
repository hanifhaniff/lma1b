"use server";

// The image upload is now handled directly by the API route in /api/laptops/upload
// This service is no longer needed since the form handles the upload directly
// The upload route now generates URLs in the format: https://file.abdul-hanif.com/laptops/{laptopId}/{filename}

export async function deleteLaptopImage(imageUrl: string): Promise<void> {
  // We'll keep this function for potential future use, but note that deletion
  // would need to be handled through the R2 API or by updating the laptop record to remove the image URL
  console.warn('deleteLaptopImage: This function is deprecated. Image deletion should be handled through R2 API or by updating the laptop record.');
  // Implementation would require R2 deletion if needed
}