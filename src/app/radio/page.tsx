import { getRadios } from './actions';
import RadioPageClient from './RadioPageClient';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function RadioPage() {
  const initialRadios = await getRadios();
  
  return (
    <RadioPageClient initialRadios={initialRadios} />
  );
}