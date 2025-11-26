import { ITAsset } from "./types";

const API_BASE_URL = "/api/it-assets";

export async function getITAssets(searchTerm?: string): Promise<ITAsset[]> {
  try {
    const url = searchTerm 
      ? `${API_BASE_URL}?search=${encodeURIComponent(searchTerm)}`
      : API_BASE_URL;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to fetch IT assets: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.map((asset: ITAsset) => ({
      ...asset,
      tanggal_diterima: new Date(asset.tanggal_diterima),
      created_at: new Date(asset.created_at),
      updated_at: new Date(asset.updated_at),
    }));
  } catch (error) {
    console.error("Error in getITAssets:", error);
    throw error;
  }
}

export type { ITAsset };
