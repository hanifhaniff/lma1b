import getSupabaseClient from './supabase-client';

export async function ensureFileSharesTable() {
  const supabase = getSupabaseClient();
  
  try {
    // Check if the file_shares table exists
    const { error } = await supabase
      .from('file_shares')
      .select('id')
      .limit(1);
    
    // If the table doesn't exist, we'll get an error
    if (error && error.code === 'PGRST116') {
      console.log('file_shares table does not exist, manual setup required');
      
      // Return false to indicate that manual setup is required
      return false;
    } else if (error) {
      console.error('Error checking file_shares table:', error);
      return false;
    }
    
    // Table exists
    return true;
  } catch (error) {
    console.error('Error in ensureFileSharesTable:', error);
    return false;
  }
}