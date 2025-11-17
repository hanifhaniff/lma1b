import { getStarlinkUsages } from './actions';
import StarlinkUsagePageClient from './StarlinkUsagePageClient';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function StarlinkUsagePage() {
  const initialUsages = await getStarlinkUsages();

  return (
    <StarlinkUsagePageClient initialUsages={initialUsages} />
  );
}