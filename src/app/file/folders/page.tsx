import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import FileFoldersClient from './FileFoldersClientNew';

export default async function FileFoldersPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }
  
  return <FileFoldersClient />;
}