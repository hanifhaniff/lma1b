export type Laptop = {
  id: string;
  created_at: string;
  name: string;
  assigned_user: string | null;
  serial_number: string;
  asset_number: string | null;
  model_type: string | null;
  no_bast: string | null;
  date_received: string;
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
  
  return response.json();
}

export async function createLaptop(laptopData: Omit<Laptop, 'id' | 'created_at'>): Promise<Laptop> {
  const response = await fetch('/api/laptops', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(laptopData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create laptop: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export async function updateLaptop(id: string, laptopData: Partial<Laptop>): Promise<Laptop> {
  const response = await fetch('/api/laptops', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, ...laptopData }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update laptop: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
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