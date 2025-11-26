import { ITAsset, ITAssetFormData } from "./types";

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

export async function createITAsset(assetData: ITAssetFormData): Promise<ITAsset> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assetData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to create IT asset: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      ...data,
      tanggal_diterima: new Date(data.tanggal_diterima),
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  } catch (error) {
    console.error("Error in createITAsset:", error);
    throw error;
  }
}

export async function updateITAsset(id: string, assetData: Partial<ITAssetFormData>): Promise<ITAsset> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, ...assetData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to update IT asset: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      ...data,
      tanggal_diterima: new Date(data.tanggal_diterima),
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  } catch (error) {
    console.error("Error in updateITAsset:", error);
    throw error;
  }
}

export async function deleteITAsset(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to delete IT asset: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error in deleteITAsset:", error);
    throw error;
  }
}

export type { ITAsset, ITAssetFormData };
