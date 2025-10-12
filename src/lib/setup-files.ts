import getSupabaseClient from './supabase-client';

export async function ensureFilesTable() {
  const supabase = getSupabaseClient();
  
  try {
    // Check if the files table exists
    const { error } = await supabase
      .from('files')
      .select('id')
      .limit(1);
    
    // If the table doesn't exist, we'll get an error
    if (error && error.code === 'PGRST116') {
      console.log('files table does not exist, manual setup required');
      
      // Return false to indicate that manual setup is required
      return false;
    } else if (error) {
      console.error('Error checking files table:', error);
      return false;
    }
    
    // Table exists
    return true;
  } catch (error) {
    console.error('Error in ensureFilesTable:', error);
    return false;
  }
}