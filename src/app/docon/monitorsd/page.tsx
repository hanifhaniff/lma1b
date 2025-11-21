import { ShopDrawing } from "@/lib/types/shop-drawing";
import ShopDrawingClient from "./client";

async function getShopDrawings(): Promise<ShopDrawing[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/docon/monitorsd`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch shop drawings:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching shop drawings:', error);
    return [];
  }
}

export default async function ShopDrawingPage() {
  const shopDrawings = await getShopDrawings();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Shop Drawing Monitoring</h1>
      <ShopDrawingClient initialData={shopDrawings} loading={false} />
    </div>
  );
}