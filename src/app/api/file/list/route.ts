import supabase from '@/lib/supabase-client';

export async function GET() {
  try {
    // Get all files from the database
    const { data, error } = await supabase
      .from('files')
      .select('file_key, nama_file, password, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return Response.json({ error: 'Failed to list files' }, { status: 500 });
    }

    // Return the list of files
    return Response.json({ 
      files: data 
    });
  } catch (error) {
    console.error('List error:', error);
    return Response.json({ error: 'Failed to list files' }, { status: 500 });
  }
}