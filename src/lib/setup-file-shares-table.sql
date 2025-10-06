-- Create the file_shares table to support file sharing functionality
-- This table stores shareable links for files with optional expiration

CREATE TABLE IF NOT EXISTS file_shares (
  id TEXT PRIMARY KEY,
  file_key TEXT NOT NULL REFERENCES files(file_key),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_file_shares_file_key ON file_shares(file_key);
CREATE INDEX IF NOT EXISTS idx_file_shares_created_at ON file_shares(created_at);
CREATE INDEX IF NOT EXISTS idx_file_shares_expires_at ON file_shares(expires_at);

-- Add a comment to explain the table structure
COMMENT ON TABLE file_shares IS 'Stores shareable links for files with optional expiration dates';