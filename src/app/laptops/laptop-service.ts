export type Laptop = {
  id: string;
  created_at: Date;
  name: string;
  assigned_user: string | null;
  serial_number: string;
  asset_number: string | null;
  model_type: string | null;
  no_bast: string | null;
  date_received: Date;
  condition: string | null;
  notes: string | null;
  image_url: string | null;
};

export async function getLaptops(): Promise<Laptop[]> {
  const response = await fetch('/api/laptops');
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch laptops: ${response.status} ${response.statusText}`);
  }
  
  const rawData = await response.json();
  
  // Convert date strings to Date objects
  return rawData.map((laptop: any) => ({
    ...laptop,
    date_received: laptop.date_received ? new Date(laptop.date_received) : new Date(),
    created_at: laptop.created_at ? new Date(laptop.created_at) : new Date(),
  }));
}

export async function createLaptop(laptopData: Omit<Laptop, 'id' | 'created_at'>): Promise<Laptop> {
  // Format dates properly before sending to API
  const formattedData: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(laptopData)) {
    if (value instanceof Date) {
      formattedData[key] = value.toISOString();
    } else {
      formattedData[key] = value;
    }
  }
  
  const response = await fetch('/api/laptops', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formattedData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create laptop: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  
  // Convert date strings back to Date objects
  return {
    ...result,
    date_received: result.date_received ? new Date(result.date_received) : new Date(),
    created_at: result.created_at ? new Date(result.created_at) : new Date(),
  };
}

export async function updateLaptop(id: string, laptopData: Partial<Laptop>): Promise<Laptop> {
  // Format dates properly before sending to API
  const formattedData: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(laptopData)) {
    if (value instanceof Date) {
      formattedData[key] = value.toISOString();
    } else {
      formattedData[key] = value;
    }
  }
  
  const response = await fetch('/api/laptops', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, ...formattedData }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update laptop: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  
  // Convert date strings back to Date objects
  return {
    ...result,
    date_received: result.date_received ? new Date(result.date_received) : new Date(),
    created_at: result.created_at ? new Date(result.created_at) : new Date(),
  };
}

export async function deleteLaptop(id: string): Promise<void> {
  const response = await fetch(`/api/laptops?id=${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete laptop: ${response.status} ${response.statusText}`);
  }
}