import { getStarlinkUsages } from './actions';
import StarlinkUsagePageClient from './StarlinkUsagePageClient';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function StarlinkUsagePage() {
  try {
    const initialUsages = await getStarlinkUsages();
    return <StarlinkUsagePageClient initialUsages={initialUsages} />;
  } catch (error) {
    console.error('Error loading initial starlink usages:', error);
    // Return component with empty data and error state
    return <StarlinkUsagePageClient initialUsages={[]} />;
  }
}