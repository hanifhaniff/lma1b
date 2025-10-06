import getSupabaseClient from '@/lib/supabase-client';
import NotFoundPage from './not-found';
import DownloadFilePage from './DownloadFilePage';

// Required table structure:
// CREATE TABLE file_shares (
//   id TEXT PRIMARY KEY,
//   file_key TEXT NOT NULL REFERENCES files(file_key),
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
//   expires_at TIMESTAMP WITH TIME ZONE
// );

async function getSharedFile(shareId: string) {
  const supabase = getSupabaseClient();
  
  try {
    // Ensure the file_shares table exists
    const { ensureFileSharesTable } = await import('@/lib/setup-file-shares');
    const tableExists = await ensureFileSharesTable();
    if (!tableExists) {
      console.error('file_shares table does not exist');
      return null;
    }

    // Get the share record
    const { data: shareData, error: shareError } = await supabase
      .from('file_shares')
      .select(`
        id,
        file_key,
        created_at,
        files!inner (file_key, nama_file, password)
      `)
      .eq('id', shareId)
      .maybeSingle();

    if (shareError || !shareData) {
      console.error('Error fetching shared file:', shareError);
      return null;
    }
    // Narrow the returned data to `any` so we can safely access DB fields
    const sd = shareData as any;

    // Check if the share has expired (assuming 7 days as defined in share API)
    const now = new Date();
    const createdAt = new Date(sd.created_at);
    const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from creation
    if (now > expiresAt) {
      // Delete expired share
      await supabase.from('file_shares').delete().eq('id', shareId);
      return null;
    }

    return {
      fileKey: sd.file_key,
      fileName: sd.files?.nama_file ?? 'Unknown File',
      requiresPassword: !!sd.files?.password,
      shareId: sd.id,
    };
  } catch (error) {
    console.error('Unexpected error in getSharedFile:', error);
    return null;
  }
}

export default async function SharePage({
  params
}: {
  params: Promise<{ shareId: string }>
}) {
  const { shareId } = await params;
  const fileData = await getSharedFile(shareId);

  if (!fileData) {
    return <NotFoundPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <DownloadFilePage
        fileKey={fileData.fileKey}
        fileName={fileData.fileName}
        requiresPassword={fileData.requiresPassword}
        shareId={shareId}
      />
    </div>
  );
}