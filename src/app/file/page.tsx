import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import FilePageClient from './FilePageClient';

export default async function FilePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }
  
  return <FilePageClient />;
} 