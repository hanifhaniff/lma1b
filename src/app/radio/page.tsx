import { getRadios } from './actions';
import RadioPageClient from './RadioPageClient';

export default async function RadioPage() {
  const initialRadios = await getRadios();
  
  return (
    <RadioPageClient initialRadios={initialRadios} />
  );
}