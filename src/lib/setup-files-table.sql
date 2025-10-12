-- Create the files table to support file management functionality
-- This table stores file metadata and password protection information

CREATE TABLE IF NOT EXISTS files (
  id bigserial NOT NULL,
  file_key text NOT NULL,
  nama_file text NOT NULL,
  password text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT files_pkey PRIMARY KEY (id),
  CONSTRAINT files_file_key_key UNIQUE (file_key)
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_files_file_key ON files(file_key);
CREATE INDEX IF NOT EXISTS idx_files_nama_file ON files(nama_file);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);

-- Add a comment to explain the table structure
COMMENT ON TABLE files IS 'Stores file metadata and password protection information';